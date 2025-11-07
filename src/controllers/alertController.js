const prisma = require('../config/database');

class AlertController {
  async list(req, res) {
    try {
      const { resolved, severity, limit = 50, offset = 0 } = req.query;

      // Get all machines for the user
      const userMachines = await prisma.machine.findMany({
        where: { userId: req.userId },
        select: { id: true }
      });

      const machineIds = userMachines.map(m => m.id);

      // Build filter
      const where = {
        machineId: { in: machineIds }
      };

      if (resolved !== undefined) {
        where.isResolved = resolved === 'true';
      }

      if (severity) {
        where.severity = severity;
      }

      const alerts = await prisma.alert.findMany({
        where,
        include: {
          machine: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      const total = await prisma.alert.count({ where });

      return res.json({
        alerts,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('List alerts error:', error);
      return res.status(500).json({ error: 'Erro ao listar alertas' });
    }
  }

  async get(req, res) {
    try {
      const { id } = req.params;

      const alert = await prisma.alert.findUnique({
        where: { id: parseInt(id) },
        include: {
          machine: {
            select: {
              id: true,
              name: true,
              type: true,
              userId: true
            }
          }
        }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alerta não encontrado' });
      }

      // Verify user owns the machine
      if (alert.machine.userId !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      return res.json(alert);
    } catch (error) {
      console.error('Get alert error:', error);
      return res.status(500).json({ error: 'Erro ao buscar alerta' });
    }
  }

  async resolve(req, res) {
    try {
      const { id } = req.params;

      const alert = await prisma.alert.findUnique({
        where: { id: parseInt(id) },
        include: {
          machine: {
            select: { userId: true }
          }
        }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alerta não encontrado' });
      }

      // Verify user owns the machine
      if (alert.machine.userId !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const updatedAlert = await prisma.alert.update({
        where: { id: parseInt(id) },
        data: {
          isResolved: true,
          resolvedAt: new Date()
        }
      });

      return res.json(updatedAlert);
    } catch (error) {
      console.error('Resolve alert error:', error);
      return res.status(500).json({ error: 'Erro ao resolver alerta' });
    }
  }

  async getMachineAlerts(req, res) {
    try {
      const { machineId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // Verify machine belongs to user
      const machine = await prisma.machine.findFirst({
        where: {
          id: parseInt(machineId),
          userId: req.userId
        }
      });

      if (!machine) {
        return res.status(404).json({ error: 'Máquina não encontrada' });
      }

      const alerts = await prisma.alert.findMany({
        where: { machineId: parseInt(machineId) },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      return res.json(alerts);
    } catch (error) {
      console.error('Get machine alerts error:', error);
      return res.status(500).json({ error: 'Erro ao buscar alertas da máquina' });
    }
  }
}

module.exports = new AlertController();
