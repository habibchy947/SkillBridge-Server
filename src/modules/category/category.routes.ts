import express, { Router } from "express";
import { categoryController } from "./category.controller";
import auth, { UserRole } from "../../middlewares/auth";
// import { UserRole } from "../../../generated/prisma/enums";


const router = express.Router();

// get all category by admin
router.get("/admin", auth(UserRole.ADMIN), categoryController.getAllCategoryByAdmin);

// get all category by all
router.get("/", categoryController.getAllCategory);

// create category
router.post("/", auth(UserRole.ADMIN), categoryController.createCategory);

// update category
router.patch("/:cate_id", auth(UserRole.ADMIN), categoryController.updateCategory);

// delete category
router.delete("/:cate_id", auth(UserRole.ADMIN), categoryController.deleteCategory)

export const categoryRouter: Router = router;