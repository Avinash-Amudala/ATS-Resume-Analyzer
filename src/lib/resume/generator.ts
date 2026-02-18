import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  AlignmentType,
  BorderStyle,
  TabStopPosition,
  TabStopType,
  convertInchesToTwip,
} from "docx";
import type { StructuredResume, TemplateStyleConfig } from "@/types";

const DEFAULT_STYLE: TemplateStyleConfig = {
  font: { name: "Calibri", size: 22 }, // size in half-points (22 = 11pt)
  headingFont: { name: "Calibri", size: 26, bold: true },
  colors: { heading: "333333", body: "000000", secondary: "555555" },
  margins: { top: 540, bottom: 540, left: 720, right: 720 }, // tighter margins
  spacing: { beforeSection: 180, afterSection: 80, lineHeight: 240 },
  sectionOrder: ["contact", "summary", "experience", "education", "skills", "projects", "certifications"],
  bulletStyle: "\u2022",
  dateFormat: "MMM YYYY",
};

/**
 * Generate a professional ATS-optimized DOCX resume.
 * - Compact layout that fits on 1-2 pages
 * - Hyperlinked LinkedIn/GitHub/portfolio URLs
 * - Proper section headers with dividers
 * - Clean bullet formatting with tight spacing
 */
export async function generateDocx(
  resumeData: StructuredResume,
  fileName: string,
  style?: Partial<TemplateStyleConfig>
): Promise<Buffer> {
  const s = { ...DEFAULT_STYLE, ...style };
  const children: Paragraph[] = [];

  // ---------- CONTACT SECTION ----------
  if (resumeData.contact?.name) {
    // Name - centered, large
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.contact.name,
            font: s.headingFont.name,
            size: 32, // 16pt
            bold: true,
            color: s.colors.heading,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
      })
    );

    // Contact line 1: Email | Phone | Location
    const contactLine1: (TextRun | ExternalHyperlink)[] = [];
    const addSep = (arr: (TextRun | ExternalHyperlink)[]) => {
      if (arr.length > 0) {
        arr.push(
          new TextRun({
            text: "  |  ",
            font: s.font.name,
            size: 20,
            color: s.colors.secondary,
          })
        );
      }
    };

    if (resumeData.contact.email) {
      addSep(contactLine1);
      contactLine1.push(
        new ExternalHyperlink({
          link: `mailto:${resumeData.contact.email}`,
          children: [
            new TextRun({
              text: resumeData.contact.email,
              font: s.font.name,
              size: 20,
              color: "0563C1",
              underline: {},
            }),
          ],
        })
      );
    }

    if (resumeData.contact.phone) {
      addSep(contactLine1);
      contactLine1.push(
        new TextRun({
          text: resumeData.contact.phone,
          font: s.font.name,
          size: 20,
          color: s.colors.body,
        })
      );
    }

    if (resumeData.contact.location) {
      addSep(contactLine1);
      contactLine1.push(
        new TextRun({
          text: resumeData.contact.location,
          font: s.font.name,
          size: 20,
          color: s.colors.body,
        })
      );
    }

    if (contactLine1.length > 0) {
      children.push(
        new Paragraph({
          children: contactLine1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 20 },
        })
      );
    }

    // Contact line 2: LinkedIn | GitHub/Portfolio
    const contactLine2: (TextRun | ExternalHyperlink)[] = [];

    if (resumeData.contact.linkedin) {
      const linkedinUrl = resumeData.contact.linkedin.startsWith("http")
        ? resumeData.contact.linkedin
        : `https://${resumeData.contact.linkedin}`;
      addSep(contactLine2);
      contactLine2.push(
        new ExternalHyperlink({
          link: linkedinUrl,
          children: [
            new TextRun({
              text: resumeData.contact.linkedin.replace(/^https?:\/\//, ""),
              font: s.font.name,
              size: 20,
              color: "0563C1",
              underline: {},
            }),
          ],
        })
      );
    }

    if (resumeData.contact.portfolio) {
      const portfolioUrl = resumeData.contact.portfolio.startsWith("http")
        ? resumeData.contact.portfolio
        : `https://${resumeData.contact.portfolio}`;
      addSep(contactLine2);
      contactLine2.push(
        new ExternalHyperlink({
          link: portfolioUrl,
          children: [
            new TextRun({
              text: resumeData.contact.portfolio.replace(/^https?:\/\//, ""),
              font: s.font.name,
              size: 20,
              color: "0563C1",
              underline: {},
            }),
          ],
        })
      );
    }

    if (contactLine2.length > 0) {
      children.push(
        new Paragraph({
          children: contactLine2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        })
      );
    }
  }

  // ---------- BUILD SECTIONS IN ORDER ----------
  const sectionOrder = s.sectionOrder || DEFAULT_STYLE.sectionOrder;

  for (const section of sectionOrder) {
    switch (section) {
      case "contact":
        break; // Already handled above

      case "summary":
        if (resumeData.summary) {
          children.push(createSectionHeader("PROFESSIONAL SUMMARY", s));
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
              spacing: { after: s.spacing.afterSection, line: s.spacing.lineHeight },
            })
          );
        }
        break;

      case "experience":
        if (resumeData.experience?.length > 0) {
          children.push(createSectionHeader("EXPERIENCE", s));

          for (const exp of resumeData.experience) {
            // Company and dates on same line using tabs
            const expTitleChildren: TextRun[] = [
              new TextRun({
                text: exp.company || "",
                font: s.font.name,
                size: s.font.size,
                bold: true,
                color: s.colors.body,
              }),
            ];

            if (exp.startDate || exp.endDate) {
              const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" - ");
              expTitleChildren.push(
                new TextRun({
                  text: `\t${dateStr}`,
                  font: s.font.name,
                  size: s.font.size,
                  color: s.colors.secondary,
                })
              );
            }

            children.push(
              new Paragraph({
                children: expTitleChildren,
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                spacing: { before: 100, after: 0 },
              })
            );

            // Job title
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
                  spacing: { after: 20 },
                })
              );
            }

            // Bullet points
            if (exp.bullets?.length > 0) {
              for (const bullet of exp.bullets) {
                const cleanBullet = bullet.replace(/^[•\-●▪◦]\s*/, "").trim();
                if (!cleanBullet) continue;
                // Skip page markers
                if (/^\d+\s+of\s+\d+/i.test(cleanBullet)) continue;
                if (/^-?\s*\d+\s+of\s+\d+\s*-*$/i.test(cleanBullet)) continue;
                if (/^page\s+\d+/i.test(cleanBullet)) continue;
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${s.bulletStyle} ${cleanBullet}`,
                        font: s.font.name,
                        size: s.font.size,
                        color: s.colors.body,
                      }),
                    ],
                    indent: { left: convertInchesToTwip(0.25) },
                    spacing: { before: 20, after: 20, line: 240 },
                  })
                );
              }
            }
          }
        }
        break;

      case "education":
        if (resumeData.education?.length > 0) {
          children.push(createSectionHeader("EDUCATION", s));

          for (const edu of resumeData.education) {
            const eduChildren: TextRun[] = [
              new TextRun({
                text: edu.institution || "",
                font: s.font.name,
                size: s.font.size,
                bold: true,
                color: s.colors.body,
              }),
            ];

            if (edu.startDate || edu.endDate) {
              const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" - ");
              eduChildren.push(
                new TextRun({
                  text: `\t${dateStr}`,
                  font: s.font.name,
                  size: s.font.size,
                  color: s.colors.secondary,
                })
              );
            }

            children.push(
              new Paragraph({
                children: eduChildren,
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                spacing: { before: 80, after: 0 },
              })
            );

            if (edu.degree) {
              const degreeText = [
                edu.degree,
                edu.field ? `in ${edu.field}` : "",
                edu.gpa ? `| GPA: ${edu.gpa}` : "",
              ].filter(Boolean).join(" ");

              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: degreeText,
                      font: s.font.name,
                      size: s.font.size,
                      italics: true,
                      color: s.colors.secondary,
                    }),
                  ],
                  spacing: { after: 40 },
                })
              );
            }
          }
        }
        break;

      case "skills":
        if (resumeData.skills?.length > 0) {
          children.push(createSectionHeader("TECHNICAL SKILLS", s));

          for (const skill of resumeData.skills) {
            const cleanSkill = skill.replace(/^[•\-●▪◦]\s*/, "").trim();
            if (!cleanSkill) continue;

            // Check if it's a "Category: items" format
            const colonIdx = cleanSkill.indexOf(":");
            if (colonIdx > 0 && colonIdx < 40) {
              const category = cleanSkill.substring(0, colonIdx).trim();
              const items = cleanSkill.substring(colonIdx + 1).trim();
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${category}: `,
                      font: s.font.name,
                      size: s.font.size,
                      bold: true,
                      color: s.colors.body,
                    }),
                    new TextRun({
                      text: items,
                      font: s.font.name,
                      size: s.font.size,
                      color: s.colors.body,
                    }),
                  ],
                  spacing: { before: 20, after: 20, line: 240 },
                })
              );
            } else {
              // Plain skill string — render as single line
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cleanSkill,
                      font: s.font.name,
                      size: s.font.size,
                      color: s.colors.body,
                    }),
                  ],
                  spacing: { before: 20, after: 20, line: 240 },
                })
              );
            }
          }
        }
        break;

      case "projects":
        if (resumeData.projects?.length > 0) {
          children.push(createSectionHeader("PROJECTS", s));

          for (const proj of resumeData.projects) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: proj.name || "",
                    font: s.font.name,
                    size: s.font.size,
                    bold: true,
                    color: s.colors.body,
                  }),
                  ...(proj.technologies?.length > 0
                    ? [
                        new TextRun({
                          text: `  (${proj.technologies.join(", ")})`,
                          font: s.font.name,
                          size: s.font.size,
                          color: s.colors.secondary,
                          italics: true,
                        }),
                      ]
                    : []),
                ],
                spacing: { before: 80, after: 0 },
              })
            );

            if (proj.bullets?.length > 0) {
              for (const bullet of proj.bullets) {
                const cleanBullet = bullet.replace(/^[•\-●▪◦]\s*/, "").trim();
                if (!cleanBullet) continue;
                // Skip page markers like "- 1 of 2 --", "Page 1", etc.
                if (/^\d+\s+of\s+\d+/i.test(cleanBullet)) continue;
                if (/^-?\s*\d+\s+of\s+\d+\s*-*$/i.test(cleanBullet)) continue;
                if (/^page\s+\d+/i.test(cleanBullet)) continue;
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${s.bulletStyle} ${cleanBullet}`,
                        font: s.font.name,
                        size: s.font.size,
                        color: s.colors.body,
                      }),
                    ],
                    indent: { left: convertInchesToTwip(0.25) },
                    spacing: { before: 20, after: 20, line: 240 },
                  })
                );
              }
            }
          }
        }
        break;

      case "certifications":
        if (resumeData.certifications?.length > 0) {
          children.push(createSectionHeader("CERTIFICATIONS", s));

          for (const cert of resumeData.certifications) {
            const cleanCert = cert.replace(/^[•\-●▪◦]\s*/, "").trim();
            if (!cleanCert) continue;
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${s.bulletStyle} ${cleanCert}`,
                    font: s.font.name,
                    size: s.font.size,
                    color: s.colors.body,
                  }),
                ],
                indent: { left: convertInchesToTwip(0.25) },
                spacing: { before: 20, after: 20 },
              })
            );
          }
        }
        break;
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
            size: {
              width: convertInchesToTwip(8.5),
              height: convertInchesToTwip(11),
            },
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: s.font.name,
            size: s.font.size,
          },
          paragraph: {
            spacing: {
              line: s.spacing.lineHeight,
            },
          },
        },
      },
    },
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
        bold: s.headingFont.bold !== false,
        color: s.colors.heading,
      }),
    ],
    spacing: { before: s.spacing.beforeSection, after: 40 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: s.colors.heading },
    },
  });
}
