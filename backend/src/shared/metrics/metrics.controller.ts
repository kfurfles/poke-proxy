import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({
    summary: 'Prometheus metrics endpoint',
    description: 'Exposes application metrics in Prometheus format',
  })
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics data',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/characters",status_code="200"} 42
http_requests_total{method="POST",route="/characters",status_code="201"} 12`,
        },
      },
    },
  })
  async getMetrics(@Res() res: Response): Promise<void> {
    const metrics = await this.metricsService.getMetrics();

    res.set({
      'Content-Type': this.metricsService.getContentType(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    res.send(metrics);
  }
}
