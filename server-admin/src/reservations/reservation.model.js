'use strict';

import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    guestName: {
        type: String,
        required: [true, 'El nombre del cliente es obligatorio']
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'La sucursal es obligatoria']
    },
    guestsCount: {
        type: Number,
        required: [true, 'El número de personas es obligatorio'],
        min: [1, 'Al menos debe ser una persona']
    },
    tables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table'
    }],
    date: {
        type: Date,
        required: [true, 'La fecha y hora de la reservación es obligatoria']
    },
    status: {
        type: String,
        enum: ['Pendiente', 'Confirmada', 'En curso', 'Completada', 'Cancelada'],
        default: 'Pendiente'
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        trim: true,
        maxLength: [300, 'Las notas no pueden exceder los 300 caracteres']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Reservation', reservationSchema);