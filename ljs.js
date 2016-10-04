function tokenize (programString) {
  return programString.replace(/\(/g,' ( ').replace(/\)/g,' ) ').trim().split(/\s+/)
}

function tokenHandler (token) {
  var float
  if (!isNaN (float = parseFloat(token))) return float
  return token
}

function parse (tokens) {
  token = tokens.shift()
  if (token === '(') {
    var expr = []
    while (tokens[0] !== ')' && typeof tokens[0] !== 'undefined') {
      expr.push(parse(tokens))
    }
    tokens.shift()
    return expr
  }
  if (token == ')'){
    throw new Error('Syntax Error')
  }
  return tokenHandler(token)
}

function Env (params, args, outer) {
  this.dict = {}
  this.outer = outer
  this.find = function (name) {
    if (name in this.dict) { return this.dict[name] }
    return outer.find(name)
  }
  this.set = function (name, val) { this.dict[name] = val }
  if (params && args) {
    if (params instanceof Array) {
      for (var i = 0; i < params.length; i++) this.set(params[i], parseInt(args[i]))
    }
    this.set (params, parseInt(args))
  }
}

var global_env = {
  '+': function (a, b) { return a+b },
  '-': function (a, b) { if (b == null) return -a; return a - b },
  '*': function (a, b) { return a * b },
  '/': function (a, b) { return a / b },
  '>': function (a, b) { return a > b },
  '>=': function (a, b) { return a >= b },
  '<': function (a, b) { return a < b },
  '<=': function (a, b) { return a <= b },
  'pi': function () { return 3.14 },
  'pow': function (a, b) { return Math.pow(a,b) },
  'length': function (a) { return a.length },
  'abs': function (a) { return Math.abs(a) },
  'append': function (a, b) { return String(a)+String(b) },
  'eq?': function (a, b) { return a == b },
  'equal?': function (a, b) { return a === b },
  'car': function (a) { return a[0] },
  'cdr': function (a) { return a[1] },
  'cons': function (a, b) { a.push(b); return a },
  'sqrt': function (a) { return Math.sqrt(a) },
  'max': function (a) { return Math.max(a) },
  'min': function (a) { return Math.min(a) },
  'round': function (a) { return Math.round(a) },
  'not': function (a) { return !a },
  'number?': function (a) { return !isNaN(a) }
}

var env = new Env()
env.dict = global_env

function eval (x, env) {
  if (typeof x === 'number') { return x }
  if (typeof x === 'string') {
    try
    { return env.find(x) }
    catch (e) { return String(x) }
  }
  if (!x instanceof Array) { return x }
  if (x[0] === 'if') { return eval(x[1], env) ? eval(x[2], env) : eval(x[3], env) }
  if (x[0] === 'define') { return env.set(x[1], eval(x[2], env)) }
  if (x[0] === 'lambda') { return function (args) { return eval(x[2], new Env(x[1], args, env)) }}
  if (x[0] === 'set!') { env.find (x[1]).set(x[1], eval(x[2], env)) }
  if (x[0] === 'quote') { return x[1] }
  if (x[0] === 'begin') {
    x.shift ()
    var out = x.pop()
    x.map (function (token) {
      eval(token, env)
    });
    return eval(out, env)
  }
  var expr1 = typeof eval(x[1], env)
  if (typeof x[2] === 'undefined') {
    if (expr1 === 'function') return eval(x[0], env)(eval(x[1](), env))
    return eval(x[0], env)(eval(x[1], env))
  }
  var expr2 = typeof eval(x[2], env)
  if (expr1 === 'function' && expr2 === 'function') return eval(x[0], env)(eval(x[1], env)(), eval(x[2], env)())
  if (expr1 === 'function') return eval(x[0], env)(eval(x[1], env)(), eval(x[2], env))
  if (expr2 === 'function') return eval(x[0], env)(eval(x[1], env), eval(x[2], env)())
  return eval(x[0], env)(eval(x[1], env), eval(x[2], env))
}

const readline = require('readline')
const rl =  readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

rl.on ('line', (input) => {
	input = input.trim()
	var solution = eval((parse(tokenize (input))), env)
	if (typeof solution === 'undefined') {}
	else console.log(solution)
})
