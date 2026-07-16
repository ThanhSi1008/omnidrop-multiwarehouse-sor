import { Controller, All, Get, Req, Res, Logger } from '@nestjs/common';
import HttpProxy from 'http-proxy';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private readonly proxy = HttpProxy.createProxyServer({});

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

  @All('products*path')
  routeProducts(@Req() req: any, @Res() res: any) {
    this.logger.log(`Proxying request for products to Core Service: ${req.method} ${req.url}`);
    this.proxy.web(req, res, { target: 'http://localhost:3001' });
  }

  @All('purchase*path')
  routePurchase(@Req() req: any, @Res() res: any) {
    this.logger.log(`Proxying request for purchase to Flash Sale Service: ${req.method} ${req.url}`);
    this.proxy.web(req, res, { target: 'http://localhost:3002' });
  }
}
