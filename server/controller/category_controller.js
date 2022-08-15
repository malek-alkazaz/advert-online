const Category = require('../model/category');


module.exports = {
    getCategory: async (req , res) =>{
        const category = await Category.find();
        return category
    },
    addCategory: async (req , res) =>{
        var i=0;
        categoryImage = []
        if (req.files.length != 0) {
            for (const single_file of req.files) {
                for (let index = 0; index < 1; index++) {;
                    categoryImage = single_file.filename;
                }
                i++;
            }
        }
        const category = await new Category({
            name : req.body.name,
            url : categoryImage
        }).save()
        .then(
            res.status(200).redirect('/category')
        );
    },
    updateCategory: async (req , res) =>{
        const category = await Category.find();
        if(!req.body){
            return res.status(400).send({ message : "Data to update can not be empty"})
        }
        Category.findOneAndUpdate(
            {_id: req.body.category_select},
            {$set:{
                name : req.body.name,
                url : req.body.url
            }},
            {new: true}).then(data =>{
                if(data === null){
                    throw new Error('Category Not Found');
                }
                res.status(200).redirect('/category');
            })
    },
    deleteCategory: async (req , res) =>{
        const id = req.body.category_select;

        Category.findByIdAndDelete(id)
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
            }else{
                // res.status(200).send({message : "Category was deleted successfully!"});
                res.status(200).redirect('/category');
            }
        })
        .catch(err =>{
            res.status(500).send({
                message: "Could not delete Category with id=" + id
            });
        });
    }
}