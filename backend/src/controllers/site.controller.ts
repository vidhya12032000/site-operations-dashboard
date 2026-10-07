import { Request, Response } from "express";
import { pool } from "../config/db";

const VALID_SITE_STATUSES = [
  "Planned",
  "Active",
  "Completed",
];

// GET ALL SITES
export const getSites = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.location,
        s.status,
        s.created_by,
        u.name AS created_by_name,
        s.created_at
      FROM sites s
      LEFT JOIN users u
        ON s.created_by = u.id
      ORDER BY s.id DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Error fetching sites:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch sites",
    });
  }
};

// CREATE SITE
export const createSite = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      location,
      status,
      created_by,
    } = req.body;

    // Required field validation
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Site name is required",
      });
    }

    if (
      typeof location !== "string" ||
      !location.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    // Status validation
    const siteStatus =
      status || "Planned";

    if (
      !VALID_SITE_STATUSES.includes(
        siteStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid site status. Allowed values: Planned, Active, Completed",
      });
    }

    // created_by validation
    if (
      created_by !== undefined &&
      created_by !== null
    ) {
      const createdById = Number(
        created_by
      );

      if (
        !Number.isInteger(createdById) ||
        createdById <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid created_by user id",
        });
      }

      // Check user exists
      const userResult =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE id = $1
          `,
          [createdById]
        );

      if (
        userResult.rows.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Created by user not found",
        });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO sites
      (
        name,
        location,
        status,
        created_by
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name.trim(),
        location.trim(),
        siteStatus,
        created_by
          ? Number(created_by)
          : null,
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Site created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error creating site:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create site",
    });
  }
};

// GET SITE BY ID
export const getSiteById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(
      req.params.id
    );

    // ID validation
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site id",
      });
    }

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.location,
        s.status,
        s.created_by,
        u.name AS created_by_name,
        s.created_at
      FROM sites s
      LEFT JOIN users u
        ON s.created_by = u.id
      WHERE s.id = $1
      `,
      [id]
    );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error fetching site:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch site",
    });
  }
};

// UPDATE SITE
export const updateSite = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(
      req.params.id
    );

    const {
      name,
      location,
      status,
      created_by,
    } = req.body;

    // ID validation
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site id",
      });
    }

    // Required field validation
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Site name is required",
      });
    }

    if (
      typeof location !== "string" ||
      !location.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    if (
      typeof status !== "string" ||
      !status.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Site status is required",
      });
    }

    // Status validation
    if (
      !VALID_SITE_STATUSES.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid site status. Allowed values: Planned, Active, Completed",
      });
    }

    // Check site exists
    const siteResult =
      await pool.query(
        `
        SELECT id
        FROM sites
        WHERE id = $1
        `,
        [id]
      );

    if (
      siteResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    // created_by validation
    let createdByValue:
      number | null = null;

    if (
      created_by !== undefined &&
      created_by !== null &&
      created_by !== ""
    ) {
      createdByValue =
        Number(created_by);

      if (
        !Number.isInteger(
          createdByValue
        ) ||
        createdByValue <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid created_by user id",
        });
      }

      // Check user exists
      const userResult =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE id = $1
          `,
          [createdByValue]
        );

      if (
        userResult.rows.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Created by user not found",
        });
      }
    }

    const result = await pool.query(
      `
      UPDATE sites
      SET
        name = $1,
        location = $2,
        status = $3,
        created_by = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        name.trim(),
        location.trim(),
        status,
        createdByValue,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message:
        "Site updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error updating site:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update site",
    });
  }
};

// DELETE SITE
export const deleteSite = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(
      req.params.id
    );

    // ID validation
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site id",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM sites
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Site deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting site:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete site",
    });
  }
};