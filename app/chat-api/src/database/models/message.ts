'use strict';
import {Model, Optional, DataTypes as _DataTypes} from 'sequelize';

interface IMessage {
    id: number,
    conversationId: number,
    userId: number,
    content: string,
}

interface IMessageCreation extends Optional<IMessage, 'id'> {
}

module.exports.model = (sequelize: any, DataTypes: typeof _DataTypes) => {
    class Message extends Model<IMessage, IMessageCreation> implements IMessage {
        id!: number;
        conversationId!: number;
        userId!: number;
        content!: string;
        readonly createdAt!: Date;
        readonly updatedAt!: Date;

        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models: any) {
            // define association here
            Message.belongsTo(models.Conversation, {as: 'Conversation', foreignKey: 'conversationId'});
        }
    }

    Message.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        conversationId: DataTypes.INTEGER,
        userId: DataTypes.INTEGER,
        content: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Message',
    });
    return Message;
};