'use strict';
import {Model, Optional, DataTypes as _DataTypes} from 'sequelize';

interface IConversation {
    id: number,
    userOneId: number,
    userTwoId: number,
}

interface IConversationCreation extends Optional<IConversation, 'id'> {
}

module.exports.model = (sequelize: any, DataTypes: typeof _DataTypes) => {
    class Conversation extends Model<IConversation, IConversationCreation> implements IConversation {
        id!: number;
        userOneId!: number;
        userTwoId!: number;
        readonly createdAt!: Date;
        readonly updatedAt!: Date;

        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models: any) {
            // define association here
            Conversation.hasMany(models.Message, {as: 'Messages', foreignKey: 'conversationId'});
        }
    }

    Conversation.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userOneId: DataTypes.INTEGER,
        userTwoId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Conversation',
    });
    return Conversation;
};