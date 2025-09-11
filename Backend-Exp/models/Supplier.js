const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    business_name: {
        type: String,
        required: true
    },
    license_number: String,
    address: String
});

export default mongoose.model("Supplier", supplierSchema);