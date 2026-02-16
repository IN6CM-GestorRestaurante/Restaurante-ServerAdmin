import bcryptjs from 'bcryptjs';
import User from './user.model.js';
import { generateJWT } from '../../helpers/generate-jwt.js';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !user.status) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales incorrectas - Correo o estado'
            });
        }

        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales incorrectas - Contraseña'
            });
        }

        const token = await generateJWT(user.id);

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            user,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hable con el administrador',
            error: error.message
        });
    }
};

export const register = async (req, res) => {
    try {
        const { name, surname, username, email, password, phone, role } = req.body;
        const user = new User({ name, surname, username, email, password, phone, role });

        const salt = bcryptjs.genSaltSync();
        user.password = bcryptjs.hashSync(password, salt);

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

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

        res.status(200).json({
            success: true,
            total,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener perfil' });
    }
};