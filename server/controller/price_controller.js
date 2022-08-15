const Price = require('../model/priceModel');


module.exports = {
    getPrice: async (req , res) =>{
        const price = await Price.find();
        return price
    },
    addPrice: async (req , res) =>{
        const price = await new Price({
            name : req.body.name,
            price : req.body.price,
        }).save();
        res.json({
            message : "add price successfuly..!"
        });
    },
    updatePrice: async (req , res) =>{
        const price = await Price.find();
        if(!req.body){
            return res.status(400).send({ message : "Data to update can not be empty"})
        }
        Price.findOneAndUpdate(
            {_id: req.body.category_select},
            {$set:{
                name : req.body.name,
                price : req.body.price
            }},
            {new: true}).then(data =>{
                if(data === null){
                    throw new Error('Price Not Found');
                }
                res.status(200).redirect('/price');
            })
    },
    deletePrice : async (req , res) =>{
        const id = req.body.category_select;

        Price.findByIdAndDelete(id)
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
            }else{
                // res.status(200).send({message : "Price was deleted successfully!"});
                res.status(200).redirect('/price');
            }
        })
        .catch(err =>{
            res.status(500).send({
                message: "Could not delete Price with id=" + id
            });
        });
    }
}