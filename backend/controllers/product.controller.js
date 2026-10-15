import Product from '../models/product.model.js'

async function postProds(req, res) {
    const { name, description, price, category, image, stock } = req.body

    if (!name || !description || !price || !category || !image || !stock) {
        return res.status(400).json({
            "message": "Please provide all required fields"
        })
    }
    if (price < 0) {
        return res.status(400).json({
            "message": "Price cannot be less than 0"
        })
    }
    if (stock < 0) {
        return res.status(400).json({
            "message": "Stock cannot be less than 0"
        })
    }

    await Product.create({
        name: name,
        description: description,
        price: price,
        category: category,
        image: image,
        stock: stock
    })

    return res.status(201).json({
        "success": true,
        "message": "Product created successfully",
    })
}

async function getAllProds (req, res) {
    const alProd = await Product.find({})
    let filtProd = alProd.map(({id, name, description, price, category, image, stock, createdAt, v}) => ({id, name, price, category, image, stock}))
    
    const srch = req.query.search
    const category = req.query.category

    if(srch){
        filtProd = filtProd.filter(prod => prod.name.toLowerCase().includes(srch.toLowerCase()))
    }

    if(category){
        filtProd = filtProd.filter(prod => prod.category === category)
    }

    const expRes = {
        "success" : true,
        "count" : filtProd.length,
        "products": filtProd
    }

    return res.status(200).json(expRes)
}

async function getProd (req, res) {
    const id = req.params.id   

    const prod = await Product.findOne({_id : id}).exec()
    
    if (!prod){
        return res.status(404).send("product not available")
    }

    return res.status(200).json(prod)
    
}

async function allCategories (req, res) {
    const cates = await Product.distinct('category')
    return res.status(200).json(cates)
}

export { postProds, getAllProds, getProd, allCategories }