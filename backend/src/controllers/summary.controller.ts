import { Request, Response } from "express";
import { pool } from "../config/db";

export const getSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM sites) AS "totalSites",

        (SELECT COUNT(*)
         FROM sites
         WHERE status = 'Active') AS "activeSites",

        (SELECT COUNT(*)
         FROM sites
         WHERE status = 'Planned') AS "plannedSites",

        (SELECT COUNT(*)
         FROM sites
         WHERE status = 'Completed') AS "completedSites",

        (SELECT COUNT(*) FROM installations) AS "totalInstallations",

        (SELECT COUNT(*)
         FROM installations
         WHERE status = 'Pending') AS "pendingInstallations",

        (SELECT COUNT(*)
         FROM installations
         WHERE status = 'In Progress') AS "inProgressInstallations",

        (SELECT COUNT(*)
         FROM installations
         WHERE status = 'Completed') AS "completedInstallations"
    `);

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching summary:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
};