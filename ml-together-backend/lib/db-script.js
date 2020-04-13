use mldev01
db.projects.insertOne({
    name: "sample project",
    description: "this is a project",
    //save a file ? 
    model: 'model script',
    functions: 'map'})

    db.projects.insertOne({
        name: "sample project 2",
        description: "this is another project",
        //save a file ? 
        model: 'model script',
        functions: 'map'})