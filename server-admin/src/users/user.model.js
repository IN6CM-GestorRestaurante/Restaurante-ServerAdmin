import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        maxLength: [25, 'El nombre no puede exceder los 25 caracteres']
    },
    surname: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        maxLength: [25, 'El apellido no puede exceder los 25 caracteres']
    },
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        unique: true
    },
    email: {
        type: String, // Usaremos el email como puente entre Postgres y Mongo
        required: [true, 'El correo es obligatorio'],
        unique: true
    },
    phone: {
        type: String,
        minLength: 8,
        maxLength: 8,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'WAITER', 'RECEPTIONIST'],
        default: 'WAITER'
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: function() { return this.role !== 'SUPER_ADMIN'; }
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: function() { return ['BRANCH_MANAGER', 'WAITER', 'RECEPTIONIST'].includes(this.role); }
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.toJSON = function () {
    const {__v, _id, ...user} = this.toObject();
    user.uid = _id;
    return user;
}

export default mongoose.model('User', userSchema);