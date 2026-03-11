import { Controller, Get, Param, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as fs from 'fs';

@Controller('debug')
export class DebugController {
  constructor(private usersService: UsersService) {}

  @Get('user/:email')
  async findUser(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return user || { message: 'Usuário não encontrado via e-mail' };
  }

  @Get('id/:id')
  async findUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return user || { message: 'Usuário não encontrado via ID' };
  }

  @Get('all')
  async listAll() {
    return this.usersService.findAll();
  }

  @Get('search/:term')
  async searchUser(@Param('term') term: string) {
    // Usamos este endpoint para procurar Flaviana ou qualquer outro termo
    const allUsers = await this.usersService.findAll(); // Precisamos verificar se existe findAll
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(term.toLowerCase()) ||
        u.email.toLowerCase().includes(term.toLowerCase()),
    );
  }

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
    fs.appendFileSync(
      logPath,
      `[TEST] ${new Date().toISOString()} - Endpoint de teste acessado\n`,
    );
    return 'Log de teste gravado';
  }
}
