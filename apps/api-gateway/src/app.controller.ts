import { Controller, All, Get, Req, Res, Logger } from '@nestjs/common';
import HttpProxy from 'http-proxy';
import * as http from 'http';
import * as crypto from 'crypto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  // Tối ưu hóa Keep-Alive Agent để tái sử dụng connection socket, giảm overhead TCP handshake ở tải cao
  private readonly keepAliveAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 2000,
    maxFreeSockets: 512,
  });

  private readonly proxy = HttpProxy.createProxyServer({
    agent: this.keepAliveAgent,
  });

  constructor() {
    this.proxy.on('error', (err: Error, req: any, res: any) => {
      this.logger.error(`Proxy error: ${err.message}`);
      if (res && typeof res.writeHead === 'function' && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 502, message: 'Bad Gateway' }));
      }
    });

    // Ensure X-Trace-Id header is attached to proxied responses
    this.proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
      const traceId = req.headers['x-trace-id'];
      if (traceId) {
        proxyRes.headers['x-trace-id'] = traceId;
        if (res && typeof res.setHeader === 'function' && !res.headersSent) {
          res.setHeader('X-Trace-Id', traceId);
        }
      }
    });
  }

  private ensureTraceId(req: any, res: any): string {
    let traceId = req.headers['x-trace-id'];
    if (!traceId) {
      traceId = `trace_${crypto.randomUUID()}`;
      req.headers['x-trace-id'] = traceId;
    }
    if (res && typeof res.setHeader === 'function' && !res.headersSent) {
      res.setHeader('X-Trace-Id', traceId);
    }
    return traceId;
  }

  @Get()
  getHello(): string {
    return 'Omnidrop Multiwarehouse SOR API Gateway is running.';
  }

  // --- PRODUCTS ROUTING ---
  @All('products')
  routeProductsBase(@Req() req: any, @Res() res: any) {
    this.forwardProducts(req, res);
  }

  @All('products/*path')
  routeProductsSub(@Req() req: any, @Res() res: any) {
    this.forwardProducts(req, res);
  }

  private forwardProducts(req: any, res: any) {
    const traceId = this.ensureTraceId(req, res);
    this.logger.log(`[${traceId}] Proxying request for products to Core Service: ${req.method} ${req.url}`);
    this.proxy.web(req, res, { target: 'http://localhost:3001' });
  }

  // --- USERS ROUTING ---
  @All('users')
  routeUsersBase(@Req() req: any, @Res() res: any) {
    this.forwardUsers(req, res);
  }

  @All('users/*path')
  routeUsersSub(@Req() req: any, @Res() res: any) {
    this.forwardUsers(req, res);
  }

  private forwardUsers(req: any, res: any) {
    const traceId = this.ensureTraceId(req, res);
    this.logger.log(`[${traceId}] Proxying request for users to Core Service: ${req.method} ${req.url}`);
    this.proxy.web(req, res, { target: 'http://localhost:3001' });
  }

  // --- PURCHASE ROUTING ---
  @All('purchase')
  routePurchaseBase(@Req() req: any, @Res() res: any) {
    this.forwardPurchase(req, res);
  }

  @All('purchase/*path')
  routePurchaseSub(@Req() req: any, @Res() res: any) {
    this.forwardPurchase(req, res);
  }

  private forwardPurchase(req: any, res: any) {
    const traceId = this.ensureTraceId(req, res);
    this.logger.log(`[${traceId}] Proxying request for purchase to Flash Sale Service: ${req.method} ${req.url}`);
    this.proxy.web(req, res, { target: 'http://localhost:3002' });
  }

  // --- ORDERS ROUTING ---
  @All('orders')
  routeOrdersBase(@Req() req: any, @Res() res: any) {
    this.forwardOrders(req, res);
  }

  @All('orders/*path')
  routeOrdersSub(@Req() req: any, @Res() res: any) {
    this.forwardOrders(req, res);
  }

  private forwardOrders(req: any, res: any) {
    const traceId = this.ensureTraceId(req, res);
    this.logger.log(`[${traceId}] Proxying request for orders to Order Routing Service: ${req.method} ${req.url}`);
    this.proxy.web(req, res, { target: 'http://localhost:3003' });
  }
}
