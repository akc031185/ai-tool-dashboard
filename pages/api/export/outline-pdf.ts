import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { problemId } = req.body;

  if (!problemId || typeof problemId !== 'string' || !mongoose.Types.ObjectId.isValid(problemId)) {
    return res.status(400).json({ message: 'Valid problemId is required' });
  }

  await dbConnect();

  try {
    const userId = (session.user as any).id;

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: Not your problem' });
    }

    if (!problem.solutionOutline) {
      return res.status(400).json({ message: 'Solution outline not generated yet' });
    }

    const outline = JSON.parse(problem.solutionOutline);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);

    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;

    const drawText = (text: string, font: any, size: number, x: number, color = rgb(0, 0, 0)) => {
      if (y < margin + 30) {
        page = pdfDoc.addPage([595, 842]);
        y = height - margin;
      }
      page.drawText(text, { x, y, size, font, color });
      y -= size + 8;
    };

    const drawWrappedText = (text: string, font: any, size: number, maxWidth: number, color = rgb(0, 0, 0)) => {
      const words = text.split(' ');
      let line = '';

      for (const word of words) {
        const testLine = line + word + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth && line !== '') {
          drawText(line.trim(), font, size, margin, color);
          line = word + ' ';
        } else {
          line = testLine;
        }
      }

      if (line.trim()) {
        drawText(line.trim(), font, size, margin, color);
      }
    };

    // Title
    const title = `Build Plan — ${problem.rawDescription.substring(0, 80)}${problem.rawDescription.length > 80 ? '...' : ''}`;
    drawText(title, helveticaBold, 20, margin, rgb(0.4, 0.2, 0.6));
    y -= 10;

    // Summary
    drawText('Summary', helveticaBold, 16, margin);
    drawWrappedText(outline.summary || 'No summary provided', helveticaFont, 12, width - 2 * margin);
    y -= 10;

    // Requirements
    drawText('Requirements', helveticaBold, 16, margin);
    if (outline.requirements && outline.requirements.length > 0) {
      outline.requirements.forEach((req: string, i: number) => {
        const bullet = `${i + 1}. `;
        drawText(bullet, helveticaFont, 12, margin);
        const bulletWidth = helveticaFont.widthOfTextAtSize(bullet, 12);

        // Wrap requirement text
        const words = req.split(' ');
        let line = '';
        const reqMaxWidth = width - 2 * margin - bulletWidth;

        for (const word of words) {
          const testLine = line + word + ' ';
          const testWidth = helveticaFont.widthOfTextAtSize(testLine, 12);

          if (testWidth > reqMaxWidth && line !== '') {
            drawText(line.trim(), helveticaFont, 12, margin + bulletWidth);
            line = word + ' ';
          } else {
            line = testLine;
          }
        }

        if (line.trim()) {
          y += 20; // Move up because we already drew the bullet
          drawText(line.trim(), helveticaFont, 12, margin + bulletWidth);
        }
      });
    }
    y -= 10;

    // Compute Plan
    if (outline.computePlan) {
      drawText('Compute Plan', helveticaBold, 16, margin);
      drawText(`Estimated Cost: ${outline.computePlan.estimatedCost || 'N/A'}`, helveticaFont, 12, margin);
      drawText(`Model Choice: ${outline.computePlan.modelChoice || 'N/A'}`, helveticaFont, 12, margin);
      drawText(`API Calls: ${outline.computePlan.apiCalls || 'N/A'}`, helveticaFont, 12, margin);
      if (outline.computePlan.reasoning) {
        drawWrappedText(outline.computePlan.reasoning, helveticaFont, 12, width - 2 * margin);
      }
      y -= 10;
    }

    // Mermaid Diagram (as text block)
    drawText('Workflow Diagram (Mermaid)', helveticaBold, 16, margin);
    if (outline.mermaidDiagram) {
      const diagramLines = outline.mermaidDiagram.split('\n');
      diagramLines.forEach((line: string) => {
        if (line.trim()) {
          drawText(line, courier, 9, margin, rgb(0.2, 0.2, 0.2));
        }
      });
    }
    y -= 10;

    // Next Actions
    drawText('Next Actions', helveticaBold, 16, margin);
    if (outline.nextActions && outline.nextActions.length > 0) {
      outline.nextActions.forEach((action: string, i: number) => {
        const bullet = `${i + 1}. `;
        drawText(bullet, helveticaFont, 12, margin);
        const bulletWidth = helveticaFont.widthOfTextAtSize(bullet, 12);

        const words = action.split(' ');
        let line = '';
        const actionMaxWidth = width - 2 * margin - bulletWidth;

        for (const word of words) {
          const testLine = line + word + ' ';
          const testWidth = helveticaFont.widthOfTextAtSize(testLine, 12);

          if (testWidth > actionMaxWidth && line !== '') {
            drawText(line.trim(), helveticaFont, 12, margin + bulletWidth);
            line = word + ' ';
          } else {
            line = testLine;
          }
        }

        if (line.trim()) {
          y += 20; // Move up because we already drew the bullet
          drawText(line.trim(), helveticaFont, 12, margin + bulletWidth);
        }
      });
    }

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="build-plan-${problemId}.pdf"`);
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
