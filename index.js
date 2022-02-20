const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { generateId, generateTimestamp } = require('./utils');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema
} = require('graphql');
const { fetchDb, saveDb } = require('./db');

let Todos = fetchDb();

const TodoType = new GraphQLObjectType({
  name: 'Todo',
  description: 'This represents a todo item',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    createTimestamp: { type: new GraphQLNonNull(GraphQLString) },
    updateTimestamp: { type: new GraphQLNonNull(GraphQLString) }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    todos: {
      type: new GraphQLList(TodoType),
      description: 'List of All Todo\'s',
      resolve: () => Todos
    },
    todo: {
      type: TodoType,
      description: 'A Single Todo',
      args: {
        id: { type: GraphQLString }
      },
      resolve: (parent, args) => Todos.find(todo => todo.id === args.id)
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addTodo: {
      type: TodoType,
      description: 'Add a todo',
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const todo = {
          id: generateId(),
          title: args.title,
          description: args.description,
          createTimestamp: generateTimestamp(),
          updateTimestamp: generateTimestamp()
        }
        Todos.push(todo);
        await saveDb(Todos);
        return todo;
      }
    },
    removeTodo: {
      type: TodoType,
      description: 'Remove a todo',
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        Todos = Todos.filter(todo => todo.id !== args.id);
        saveDb(Todos);
        return Todos[args.id];
      }
    },
    updateTodo: {
      type: TodoType,
      description: 'Update a todo',
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const index = Todos.findIndex(x => x.id === args.id);
        Todos[index].title = args.title;
        Todos[index].description = args.description;
        Todos[index].updateTimestamp = generateTimestamp();
        saveDb(Todos);
        return Todos[index];
      }
    },
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

const app = express();
const port = 4000
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(port);
