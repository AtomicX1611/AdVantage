import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

const AdminsModel = mongoose.models.Admins || mongoose.model("Admins", adminSchema);

// Backward-compat alias: Payment documents may reference refPath model name "Admin".
// Registering this alias prevents MissingSchemaError while keeping the same collection.
if (!mongoose.models.Admin) {
    mongoose.model("Admin", adminSchema, AdminsModel.collection.name);
}

export default AdminsModel;