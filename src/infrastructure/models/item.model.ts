import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database/mysql';

interface ItemAttributes {
    id: number;
    name: string;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ItemModel extends Model<ItemAttributes, Omit<ItemAttributes, 'id'>> {
    public id!: number;
    public name!: string;
    public price!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ItemModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        get() {
            return Number(this.getDataValue('price'));
        }
    }
}, {
    sequelize,
    modelName: 'Item',
    tableName: 'items'
}); 