import express from "express";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const seller = req.user.toObject();
  delete seller.password;
  res.json(seller);
});

export default router;
