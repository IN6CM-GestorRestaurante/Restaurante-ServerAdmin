import mongoose from 'mongoose';
import User from './user.model.js';

export const getUsers = async (req, res) => {
    try {
        const { limit = 10, from = 0 } = req.query;
        const query = { status: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(from))
                .limit(Number(limit))
        ]);

        res.status(200).json({ success: true, total, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            status: req.body.status !== undefined ? req.body.status === true || req.body.status === 'true' : true,
        };

        const user = new User(payload);
        await user.save();

        res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }

        const updateData = { ...req.body };
        if (updateData.status !== undefined) {
            updateData.status = updateData.status === true || updateData.status === 'true';
        }

        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.status(200).json({ success: true, message: 'Usuario actualizado exitosamente', data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
    }
};

export const changeUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID no válido' });
        }

        const user = await User.findByIdAndUpdate(id, { status: isActive }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            success: true,
            message: `Usuario ${action} exitosamente`,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cambiar el estado del usuario', error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener perfil' });
    }
};

export const syncProfile = async (req, res) => {
    try {
        const { email, role } = req.body;
        
        const user = new User({
            name: "Usuario",
            surname: "Nuevo",
            username: email.split('@')[0],
            email,
            phone: "00000000",
            role,
            status: true
        });

        await user.save();

        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error("Error al sincronizar perfil:", error);
        res.status(500).json({ success: false, message: 'Error al sincronizar perfil en Mongo' });
    }
};