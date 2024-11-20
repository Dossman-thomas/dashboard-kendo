import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/index.js';

// Permission model
export const RolePermissionModel = sequelize.define('permissions', {
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    canCreate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    canRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    canUpdate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    canDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
});