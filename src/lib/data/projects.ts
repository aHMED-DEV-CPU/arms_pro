import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { IProject } from "@/types";
import { serializeDoc } from "./serialize";

export async function getProjects(): Promise<IProject[]> {
  await dbConnect();
  const projects = await Project.find()
    .sort({ displayOrder: 1 })
    .lean();
  return serializeDoc<IProject[]>(projects);
}

export async function getFeaturedProjects(): Promise<IProject[]> {
  await dbConnect();
  const projects = await Project.find({ featured: true })
    .sort({ displayOrder: 1 })
    .lean();
  return serializeDoc<IProject[]>(projects);
}

export async function getProjectBySlug(slug: string): Promise<IProject | null> {
  await dbConnect();
  const project = await Project.findOne({ slug }).lean();
  return serializeDoc<IProject | null>(project);
}
