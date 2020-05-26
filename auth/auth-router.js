const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Users = require('../users/users-model')
const {isValid} = require('../users/users-service')

function generateToken(user){
  const payload ={
    sub: user.id,
    username: user.username,
    
  }
  const secret = process.env.JWT_SECRET || 'drowssaPPassword'

  const options ={
    expiresIn: '1d'
  }
  return jwt.sign(payload, secret , options)
}

router.post('/register', (req, res) => {
  // implement registration
  const credentials = req.body;
  if(isValid(credentials)){
    const rounds = process.env.BCRYPT_ROUNDS || 12;
    const hash = bcryptjs.hashSync(credentials.password, rounds)

    credentials.password = hash;

    Users.add(credentials)
      .then(user =>{
        res.status(201).json({message: 'register successful', username: credentials.username})

      })
      .catch(err =>{
        res.status(500).json({message: err.message})
      })
  }else{
    res.status(400).json({message: 'please provide username and password'})
  }

});

router.post('/login', (req, res) => {
  // implement login
  const {username, password} = req.body;

  if(isValid(req.body)){
    Users.findBy({username})
    .then(([user])=>{
      //console.log('FIND', user)
      if(user && bcryptjs.compareSync(password, user.password)){
        const token = generateToken(user)
        res.status(200).json({message: 'Welcome, have a seat your token will be with you soon', token})
      }else{
        res.status(401).json({message: 'invalid credentials!'})
      }
    }).catch(err =>{
      console.log(err, 'from login')
      res.status(500).json({message: err.message})
    })
  }else{
    res.status(400).json({
      message: 'please provide username and password!'
    })
  }
});

module.exports = router;