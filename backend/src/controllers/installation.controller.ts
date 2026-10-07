import { Request, Response } from "express";
import { pool } from "../config/db";

const VALID_INSTALLATION_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
];

// Validate YYYY-MM-DD date
const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

// GET ALL INSTALLATIONS
export const getInstallations = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.site_id,
        s.name AS site_name,
        i.assigned_to,
        u.name AS assigned_to_name,
        i.installation_type,
        i.status,
        i.start_date,
        i.completion_date,
        i.created_at
      FROM installations i
      JOIN sites s
        ON i.site_id = s.id
      LEFT JOIN users u
        ON i.assigned_to = u.id
      ORDER BY i.id DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Error fetching installations:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch installations",
    });
  }
};

// CREATE INSTALLATION
export const createInstallation = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      site_id,
      assigned_to,
      installation_type,
      status,
      start_date,
      completion_date,
    } = req.body;

    // Installation type validation
    if (
      typeof installation_type !== "string" ||
      !installation_type.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Installation type is required",
      });
    }

    // Site ID validation
    const siteId = Number(site_id);

    if (
      !Number.isInteger(siteId) ||
      siteId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site id",
      });
    }

    // Check site exists
    const siteResult = await pool.query(
      `
      SELECT id
      FROM sites
      WHERE id = $1
      `,
      [siteId]
    );

    if (siteResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Site not found",
      });
    }

    // Status validation
    const installationStatus =
      status || "Pending";

    if (
      !VALID_INSTALLATION_STATUSES.includes(
        installationStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid installation status. Allowed values: Pending, In Progress, Completed",
      });
    }

    // Assigned user validation
    let assignedToValue:
      number | null = null;

    if (
      assigned_to !== undefined &&
      assigned_to !== null &&
      assigned_to !== ""
    ) {
      assignedToValue = Number(
        assigned_to
      );

      if (
        !Number.isInteger(
          assignedToValue
        ) ||
        assignedToValue <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid assigned_to user id",
        });
      }

      const userResult =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE id = $1
          `,
          [assignedToValue]
        );

      if (
        userResult.rows.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned user not found",
        });
      }
    }

    // Date validation
    if (
      start_date &&
      !isValidDate(start_date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid start date. Use YYYY-MM-DD format",
      });
    }

    if (
      completion_date &&
      !isValidDate(completion_date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid completion date. Use YYYY-MM-DD format",
      });
    }

    // Completion date cannot be before start date
    if (
      start_date &&
      completion_date &&
      completion_date < start_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completion date cannot be before start date",
      });
    }

    // Insert installation
    const result = await pool.query(
      `
      INSERT INTO installations
      (
        site_id,
        assigned_to,
        installation_type,
        status,
        start_date,
        completion_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        siteId,
        assignedToValue,
        installation_type.trim(),
        installationStatus,
        start_date || null,
        completion_date || null,
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Installation created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error creating installation:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create installation",
    });
  }
};

// GET INSTALLATION BY ID
export const getInstallationById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(
      req.params.id
    );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid installation id",
      });
    }

    const result = await pool.query(
      `
      SELECT
        i.id,
        i.site_id,
        s.name AS site_name,
        i.assigned_to,
        u.name AS assigned_to_name,
        i.installation_type,
        i.status,
        i.start_date,
        i.completion_date,
        i.created_at
      FROM installations i
      JOIN sites s
        ON i.site_id = s.id
      LEFT JOIN users u
        ON i.assigned_to = u.id
      WHERE i.id = $1
      `,
      [id]
    );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Installation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error fetching installation:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch installation",
    });
  }
};

// UPDATE INSTALLATION
export const updateInstallation = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(
      req.params.id
    );

    const {
      site_id,
      assigned_to,
      installation_type,
      status,
      start_date,
      completion_date,
    } = req.body;

    // Installation ID validation
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid installation id",
      });
    }

    // Check installation exists
    const installationResult =
      await pool.query(
        `
        SELECT id
        FROM installations
        WHERE id = $1
        `,
        [id]
      );

    if (
      installationResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Installation not found",
      });
    }

    // Required fields
    if (
      typeof installation_type !==
        "string" ||
      !installation_type.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Installation type is required",
      });
    }

    // Site ID validation
    const siteId = Number(site_id);

    if (
      !Number.isInteger(siteId) ||
      siteId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site id",
      });
    }

    // Check site exists
    const siteResult = await pool.query(
      `
      SELECT id
      FROM sites
      WHERE id = $1
      `,
      [siteId]
    );

    if (siteResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Site not found",
      });
    }

    // Status validation
    if (
      typeof status !== "string" ||
      !status.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Installation status is required",
      });
    }

    if (
      !VALID_INSTALLATION_STATUSES.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid installation status. Allowed values: Pending, In Progress, Completed",
      });
    }

    // Assigned user validation
    let assignedToValue:
      number | null = null;

    if (
      assigned_to !== undefined &&
      assigned_to !== null &&
      assigned_to !== ""
    ) {
      assignedToValue = Number(
        assigned_to
      );

      if (
        !Number.isInteger(
          assignedToValue
        ) ||
        assignedToValue <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid assigned_to user id",
        });
      }

      const userResult =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE id = $1
          `,
          [assignedToValue]
        );

      if (
        userResult.rows.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned user not found",
        });
      }
    }

    // Date validation
    if (
      start_date &&
      !isValidDate(start_date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid start date. Use YYYY-MM-DD format",
      });
    }

    if (
      completion_date &&
      !isValidDate(completion_date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid completion date. Use YYYY-MM-DD format",
      });
    }

    // Date relationship validation
    if (
      start_date &&
      completion_date &&
      completion_date < start_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completion date cannot be before start date",
      });
    }

    // Update
    const result = await pool.query(
      `
      UPDATE installations
      SET
        site_id = $1,
        assigned_to = $2,
        installation_type = $3,
        status = $4,
        start_date = $5,
        completion_date = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        siteId,
        assignedToValue,
        installation_type.trim(),
        status,
        start_date || null,
        completion_date || null,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message:
        "Installation updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error updating installation:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update installation",
    });
  }
};

// DELETE INSTALLATION
export const deleteInstallation = async (
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
        message:
          "Invalid installation id",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM installations
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
        message:
          "Installation not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Installation deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting installation:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete installation",
    });
  }
};