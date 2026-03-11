import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';

@Controller('debug')
export class DebugController {
    @Get('webhook-logs')
    getLogs() {
        const logPath = '/tmp/abacatepay-webhook.log';
        if (fs.existsSync(logPath)) {
            return fs.readFileSync(logPath, 'utf8');
        }
        return 'Nenhum log encontrado em ' + logPath;
    }

    @Get('test-log')
    testLog() {
        const logPath = '/tmp/abacatepay-webhook.log';
        fs.appendFileSync(logPath, `[TEST] ${new Date().toISOString()} - Endpoint de teste acessado\n`);
        return 'Log de teste gravado';
    }
}
