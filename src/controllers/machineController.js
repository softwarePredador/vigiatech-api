const prisma = require('../config/database');

class MachineController {
  async list(req, res) {
    try {
      const machines = await prisma.machine.findMany({
        where: { userId: req.userId },
        include: {
          _count: {
            select: {
              alerts: {
                where: { isResolved: false }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(machines);
    } catch (error) {
      console.error('List machines error:', error);
      return res.status(500).json({ error: 'Erro ao listar máquinas' });
    }
  }

  async create(req, res) {
    try {
      const { name, type, description, lastMaintenance } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nome da máquina é obrigatório' });
      }

      const machine = await prisma.machine.create({
        data: {
          name,
          type,
          description,
          lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
          userId: req.userId
        }
      });

      return res.status(201).json(machine);
    } catch (error) {
      console.error('Create machine error:', error);
      return res.status(500).json({ error: 'Erro ao criar máquina' });
    }
  }

  async get(req, res) {
    try {
      const { id } = req.params;

      const machine = await prisma.machine.findFirst({
        where: {
          id: parseInt(id),
          userId: req.userId
        },
        include: {
          alerts: {
            where: { isResolved: false },
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      });

      if (!machine) {
        return res.status(404).json({ error: 'Máquina não encontrada' });
      }

      return res.json(machine);
    } catch (error) {
      console.error('Get machine error:', error);
      return res.status(500).json({ error: 'Erro ao buscar máquina' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, type, description, status, lastMaintenance } = req.body;

      const machine = await prisma.machine.findFirst({
        where: {
          id: parseInt(id),
          userId: req.userId
        }
      });

      if (!machine) {
        return res.status(404).json({ error: 'Máquina não encontrada' });
      }

      const updatedMachine = await prisma.machine.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(type && { type }),
          ...(description && { description }),
          ...(status && { status }),
          ...(lastMaintenance && { lastMaintenance: new Date(lastMaintenance) })
        }
      });

      return res.json(updatedMachine);
    } catch (error) {
      console.error('Update machine error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar máquina' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const machine = await prisma.machine.findFirst({
        where: {
          id: parseInt(id),
          userId: req.userId
        }
      });

      if (!machine) {
        return res.status(404).json({ error: 'Máquina não encontrada' });
      }

      await prisma.machine.delete({
        where: { id: parseInt(id) }
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Delete machine error:', error);
      return res.status(500).json({ error: 'Erro ao deletar máquina' });
    }
  }

  async getVibrationData(req, res) {
    try {
      const { id } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      // Verify machine belongs to user
      const machine = await prisma.machine.findFirst({
        where: {
          id: parseInt(id),
          userId: req.userId
        }
      });

      if (!machine) {
        return res.status(404).json({ error: 'Máquina não encontrada' });
      }

      const vibrationData = await prisma.vibrationData.findMany({
        where: { machineId: parseInt(id) },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      return res.json(vibrationData);
    } catch (error) {
      console.error('Get vibration data error:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados de vibração' });
    }
  }
}

module.exports = new MachineController();
