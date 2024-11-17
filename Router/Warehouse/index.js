const express = require("express");
const WAREHOUSE_CONTROLLER = require("../../Controllers/Warehouse/Warehouse.Controller");
const {
  verifyToken,
  verifyTokenAdmin,
} = require("../../Middleware/verifyToken")
;const router = express.Router();

router.post(
  "/createWarehouse",
  verifyToken,
  WAREHOUSE_CONTROLLER.createWarehouseEntry);
router.get(
  "/getAllWarehouse",
  verifyToken,
  WAREHOUSE_CONTROLLER.getAllWarehouseEntries
);
router.get("/getWarehouseById/:entryId", WAREHOUSE_CONTROLLER.getWarehouseEntryById);

module.exports = router;
