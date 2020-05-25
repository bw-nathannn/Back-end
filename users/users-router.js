const router = require('express').Router()

const Users = require('./users-model')
const restricted = require('../auth/restricted-model')

router.use(restricted)

router.get('/', (req, res)=>{
    Users.find()
        .then(users =>{
            res.status(200).json({users, jwt: req.jwt})
        })
        .catch(err =>{
            res.status(403).json(err, {message: 'you cant enter'})
        })
})

router.get('/:id', (req, res)=>{
    Users.findBy(req.params.id)
    .then(users =>{
        if(users){
            res.status(200).json(users)
        }else{
            res.status(400).json({message: 'this specific user could not be found'})
        }
    }).catch(err =>{
        res.status(500).json({message: err.message})
    })
})

router.get('/:id/ailments',(req, res)=>{
    const {id} = req.params;
    Users.getUsersAilments(id)
        .then(ailments =>{
            if(ailments){
                res.json(ailments)
            }else{
                res.status(404).json({message: 'Failed to retreive ailments for this user'})
            }
        }).catch(err =>{
            res.status(500).json({message: err.message})
        })
})

router.post('/:id/ailments', (req, res)=>{
    
    const ailmentData = req.body
    Users.addAilment(ailmentData)
    .then(ailment =>{
        res.status(201).json({added: ailment})
    }).catch(err =>{
        res.status(500).json({message: 'Failed to add new ailment'})
    })
})

router.put('/:id/ailments/:id', (req, res)=>{
    const {id} = req.params;
    const changes = req.body;

    Users.findBy(id)
    .then(updates =>{
        if(updates){
            Users.updateUsersAilment(changes, id)
                .then(updatedAilment =>{
                    res.json(updatedAilment)
                })
        }else{
            res.status(404).json({message:'could not update this ailment by id'})
        }
    }).catch(err =>{
        res.status(500).json({message: err.message})
    })
})

router.delete('/:id/ailments/:id', (req, res) =>{
    Users.deleteUsersAilment(req.params.id)
        .then(removed =>{
            if(removed > 0){
                res.status(200).json({removed: removed})
            }else{
                res.status(500).json({
                    message: 'This ailment failed to delete'
                })
            }
        })
})

module.exports = router;