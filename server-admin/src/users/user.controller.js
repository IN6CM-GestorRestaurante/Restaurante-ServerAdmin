import User from './user.model.js';

export const getUsers = async (req, res) => {
    try {
        const {limit = 10, from = 0} = req.query;
        const query = {status: true};

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(from))
                .limit(Number(limit))
        ]);

        res.status(200).json({success: true, total, users});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error al obtener usuarios', error: error.message});
    }
};

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({success: true, user: req.user});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error al obtener perfil'});
    }
};

export const syncProfile = async (req, res) => {
    try {
        const {email, role} = req.body;

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

        res.status(201).json({success: true, user});
    } catch (error) {
        console.error("Error al sincronizar perfil:", error);
        res.status(500).json({success: false, message: 'Error al sincronizar perfil en Mongo'});
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, password, email, ...resto } = req.body;

        const user = await User.findByIdAndUpdate(id, resto, { new: true });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
    }
};

export const changeUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        user.status = !user.status;
        await user.save();

        res.status(200).json({ success: true, user, message: `Usuario ${user.status ? 'activado' : 'desactivado'} con éxito` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cambiar estado del usuario', error: error.message });
    }
};