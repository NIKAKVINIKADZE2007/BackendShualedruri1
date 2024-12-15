#! /usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';

const program = new Command();

async function getdata() {
  const rawData = await fs.readFile('cart.json', 'utf-8');
  const data = await JSON.parse(rawData);

  return data;
}

program
  .command('create')
  .argument('<category>')
  .argument('<price>')
  .argument('<description>')
  .argument('<amount>')
  .action(async (category, price, description, amount) => {
    const data = await getdata();
    if (price * amount < 10) {
      console.log('price must be atleast 10');
      return;
    }
    const lastid = data.length > 0 ? data[data.length - 1].id + 1 : 1;
    const newExpense = {
      id: lastid,
      date: new Date().toISOString(),
      category,
      price: Number(price),
      description,
      amount,
    };

    data.push(newExpense);
    await fs.writeFile('cart.json', JSON.stringify(data));
  });

program
  .command('read')
  .option('--asc')
  .option('--desc')
  .action(async (opts) => {
    const data = await getdata();
    if (opts.asc) {
      const newdata = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      console.log(newdata);
      return;
    }
    if (opts.desc) {
      const newdata = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log(newdata);
      return;
    }
    console.log(data);
  });

program
  .command('update')
  .argument('<id>')
  .option('<category> --category')
  .option('<price> --price')
  .option('<description> --description')
  .option('<amount> --amount')
  .action(async (id, opts) => {
    const data = await getdata();
    const index = data.findIndex((el) => el.id === Number(id));
    if (index === -1) {
      console.log('wrong id for element');
      return;
    }
    const expense = data[index];

    if (opts.price) expense.price = Number(opts.price);
    if (opts.price < 10) {
      expense.price = data[index].price;
      console.log('price unda iyos minimum 10');
      return;
    }

    if (opts.category) expense.category = opts.category;

    if (opts.description) expense.description = opts.description;
    if (opts.amount) expense.amount = opts.amount;

    data.splice(index, 1, expense);

    console.log(data);

    await fs.writeFile('cart.json', JSON.stringify(data));
  });

program
  .command('delete')
  .argument('<id>')
  .action(async (id) => {
    const data = await getdata();
    const newData = data.filter((el) => el.id !== Number(id));
    await fs.writeFile('cart.json', JSON.stringify(newData));
  });

program
  .command('getById')
  .argument('<id>')
  .action(async (id) => {
    const data = await getdata();
    console.log(data[id]);
  });

program
  .command('price')
  .option('--asc')
  .option('--desc')
  .action(async (opts) => {
    const data = await getdata();
    if (opts.asc) {
      const filtedData = data.sort((a, b) => a.price - b.price);
      console.log(filtedData);
      return;
    }
    if (opts.desc) {
      const filtedData = data.sort((a, b) => b.price - a.price);
      console.log(filtedData);
      return;
    }
    console.log('gamoayole an asc an desc');
  });

program.parse();
