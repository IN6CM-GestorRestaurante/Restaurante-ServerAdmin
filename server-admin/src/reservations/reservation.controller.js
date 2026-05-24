'use strict';

import mongoose from 'mongoose';
import Reservation from './reservation.model.js';
import Table from '../tables/table.model.js';

export const getReservations = async (req, res) => {
    try {
        const {branch, guestName, status} = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (branch) filter.branch = branch;
        if (guestName) filter.guestName = { $regex: guestName, $options: 'i' };

        const reservations = await Reservation.find(filter)
            .populate('branch', 'name')
            .populate('tables', 'number')
            .sort({date: 1});

        res.status(200).json({
            success: true,
            total: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reservaciones',
            error: error.message
        });
    }
};

export const getReservationById = async (req, res) => {
    try {
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: 'ID no válido'});
        }

        const reservation = await Reservation.findById(id)
            .populate('branch', 'name')
            .populate('tables', 'number');

        if (!reservation) {
            return res.status(404).json({success: false, message: 'Reservación no encontrada'});
        }

        res.status(200).json({success: true, data: reservation});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
};

export const createReservation = async (req, res) => {
    try {
        const reservationData = req.body;

        const reservation = new Reservation(reservationData);
        await reservation.save();

        res.status(201).json({
            success: true,
            message: 'Reservación creada exitosamente',
            data: reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la reservación',
            error: error.message
        });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const {id} = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: 'ID no válido'});
        }

        const reservation = await Reservation.findByIdAndUpdate(id, updateData, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!reservation) {
            return res.status(404).json({success: false, message: 'Reservación no encontrada'});
        }

        res.status(200).json({
            success: true,
            message: 'Reservación actualizada correctamente',
            data: reservation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la reservación',
            error: error.message
        });
    }
};

export const changeReservationStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: 'ID no válido'});
        }

        const reservation = await Reservation.findByIdAndUpdate(
            id,
            {isActive},
            {returnDocument: 'after'}
        );

        if (!reservation) {
            return res.status(404).json({success: false, message: 'Reservación no encontrada'});
        }

        res.status(200).json({
            success: true,
            message: `Reservación ${action} exitosamente`,
            data: reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la reservación',
            error: error.message
        });
    }
};

/**
 * Algoritmo combinatorio inteligente de asignación de mesas por capacidad de comensales.
 */
export const getSmartTableAllocation = async (req, res) => {
  const { branchId, guestsCount } = req.query;
  const neededCapacity = parseInt(guestsCount, 10);

  if (!branchId || isNaN(neededCapacity)) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: branchId y guestsCount.' });
  }

  try {
    // Extraer mesas operacionales de la sucursal bajo aislamiento Multi-Tenant con estado 'Disponible'
    const availableTables = await Table.find({
      branch: branchId,
      status: 'Disponible',
      isActive: true
    }).sort({ capacity: 1 }).lean();

    // Caso A: Asignación Directa de Mesa Óptima
    const optimalSingleTable = availableTables.find(t => t.capacity >= neededCapacity);
    if (optimalSingleTable) {
      return res.status(200).json({ strategy: 'SINGLE_TABLE', allocation: [optimalSingleTable] });
    }

    // Caso B: Algoritmo Combinatorio Dinámico (Suma de capacidades por proximidad espacial)
    let currentCapacity = 0;
    const allocatedSuite = [];

    for (const table of availableTables) {
      allocatedSuite.push(table);
      currentCapacity += table.capacity;
      if (currentCapacity >= neededCapacity) break;
    }

    if (currentCapacity < neededCapacity) {
      return res.status(404).json({ error: 'RESERVATION_DENIED_INSUFFICIENT_COMBINED_CAPACITY' });
    }

    return res.status(200).json({ strategy: 'COMBINED_TABLES', allocation: allocatedSuite });

  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', details: error.message });
  }
};

/**
 * Alias for smart allocation to support standard findAvailableTablesForParty route naming.
 */
export const findAvailableTablesForParty = getSmartTableAllocation;