import { Controller, All, Get, Req, Res, Logger } from '@nestjs/common';
import HttpProxy from 'http-proxy';
import * as http from 'http';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  // Tối ưu hóa Keep-Alive Agent để tái sử dụng connection socket, giảm overhead TCP handshake ở tải cao
  private readonly keepAliveAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 1000,
    maxFreeSockets: 256,
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
    this.logger.log(`Proxying request for products to Core Service: ${req.method} ${req.url}`);
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
    this.logger.log(`Proxying request for purchase to Flash Sale Service: ${req.method} ${req.url}`);
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
    this.logger.log(`Proxying request for orders to Order Routing Service: ${req.method} ${req.url}`);
    this.proxy.web(req, res, { target: 'http://localhost:3003' });
  }
}
