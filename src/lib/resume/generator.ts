import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { StructuredResume, TemplateStyleConfig } from "@/types";

const DEFAULT_STYLE: TemplateStyleConfig = {
  font: { name: "Calibri", size: 22 }, // size in half-points (22 = 11pt)
  headingFont: { name: "Calibri", size: 28, bold: true },
  colors: { heading: "2563eb", body: "000000", secondary: "475569" },
  margins: { top: 720, bottom: 720, left: 720, right: 720 },
  spacing: { beforeSection: 240, afterSection: 120, lineHeight: 240 },
  sectionOrder: ["contact", "summary", "experience", "education", "skills", "projects", "certifications"],
  bulletStyle: "\u2022",
  dateFormat: "MMM YYYY",
};

export async function generateDocx(
  resumeData: StructuredResume,
  fileName: string,
  style?: Partial<TemplateStyleConfig>
): Promise<Buffer> {
  const s = { ...DEFAULT_STYLE, ...style };
  const children: Paragraph[] = [];

  // Contact section
  if (resumeData.contact?.name) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.contact.name,
            font: s.headingFont.name,
            size: 36,
            bold: true,
            color: s.colors.heading,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    const contactParts: string[] = [];
    if (resumeData.contact.email) contactParts.push(resumeData.contact.email);
    if (resumeData.contact.phone) contactParts.push(resumeData.contact.phone);
    if (resumeData.contact.linkedin) contactParts.push(resumeData.contact.linkedin);
    if (resumeData.contact.location) contactParts.push(resumeData.contact.location);

    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join("  |  "),
              font: s.font.name,
              size: s.font.size,
              color: s.colors.secondary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: s.spacing.afterSection },
        })
      );
    }
  }

  // Summary
  if (resumeData.summary) {
    children.push(createSectionHeader("PROFESSIONAL SUMMARY", s));
    children.push(createDivider());
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.summary,
            font: s.font.name,
            size: s.font.size,
            color: s.colors.body,
          }),
        ],
        spacing: { after: s.spacing.afterSection },
      })
    );
  }

  // Experience
  if (resumeData.experience?.length > 0) {
    children.push(createSectionHeader("EXPERIENCE", s));
    children.push(createDivider());

    for (const exp of resumeData.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              font: s.font.name,
              size: s.font.size,
              bold: true,
              color: s.colors.body,
            }),
            new TextRun({
              text: exp.startDate && exp.endDate ? `  |  ${exp.startDate} - ${exp.endDate}` : "",
              font: s.font.name,
              size: s.font.size,
              color: s.colors.secondary,
            }),
          ],
          spacing: { before: 120 },
        })
      );

      if (exp.title) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.title,
                font: s.font.name,
                size: s.font.size,
                italics: true,
                color: s.colors.secondary,
              }),
            ],
          })
        );
      }

      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${s.bulletStyle} ${bullet.replace(/^[•\-●]\s*/, "")}`,
                font: s.font.name,
                size: s.font.size,
                color: s.colors.body,
              }),
            ],
            indent: { left: 360 },
            spacing: { before: 40 },
          })
        );
      }
    }
  }

  // Education
  if (resumeData.education?.length > 0) {
    children.push(createSectionHeader("EDUCATION", s));
    children.push(createDivider());

    for (const edu of resumeData.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.institution,
              font: s.font.name,
              size: s.font.size,
              bold: true,
              color: s.colors.body,
            }),
            new TextRun({
              text: edu.startDate && edu.endDate ? `  |  ${edu.startDate} - ${edu.endDate}` : "",
              font: s.font.name,
              size: s.font.size,
              color: s.colors.secondary,
            }),
          ],
          spacing: { before: 120 },
        })
      );
      if (edu.degree) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree}${edu.field ? ` in ${edu.field}` : ""}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}`,
                font: s.font.name,
                size: s.font.size,
                color: s.colors.secondary,
              }),
            ],
          })
        );
      }
    }
  }

  // Skills
  if (resumeData.skills?.length > 0) {
    children.push(createSectionHeader("SKILLS", s));
    children.push(createDivider());
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.skills.join("  |  "),
            font: s.font.name,
            size: s.font.size,
            color: s.colors.body,
          }),
        ],
        spacing: { after: s.spacing.afterSection },
      })
    );
  }

  // Projects
  if (resumeData.projects?.length > 0) {
    children.push(createSectionHeader("PROJECTS", s));
    children.push(createDivider());

    for (const proj of resumeData.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.name,
              font: s.font.name,
              size: s.font.size,
              bold: true,
              color: s.colors.body,
            }),
          ],
          spacing: { before: 120 },
        })
      );

      for (const bullet of proj.bullets) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${s.bulletStyle} ${bullet.replace(/^[•\-●]\s*/, "")}`,
                font: s.font.name,
                size: s.font.size,
                color: s.colors.body,
              }),
            ],
            indent: { left: 360 },
            spacing: { before: 40 },
          })
        );
      }
    }
  }

  // Certifications
  if (resumeData.certifications?.length > 0) {
    children.push(createSectionHeader("CERTIFICATIONS", s));
    children.push(createDivider());

    for (const cert of resumeData.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${s.bulletStyle} ${cert}`,
              font: s.font.name,
              size: s.font.size,
              color: s.colors.body,
            }),
          ],
          indent: { left: 360 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: s.margins.top,
              bottom: s.margins.bottom,
              left: s.margins.left,
              right: s.margins.right,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

function createSectionHeader(title: string, s: TemplateStyleConfig): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        font: s.headingFont.name,
        size: s.headingFont.size,
        bold: s.headingFont.bold,
        color: s.colors.heading,
      }),
    ],
    spacing: { before: s.spacing.beforeSection, after: 60 },
  });
}

function createDivider(): Paragraph {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
    spacing: { after: 120 },
  });
}
