package com.jobtracker.service;

import com.jobtracker.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty or missing.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            filename = "document.pdf";
        }
        String lowerFilename = filename.toLowerCase();

        log.info("Extracting resume text from file [{}] size [{}] bytes", filename, file.getSize());

        try {
            if (lowerFilename.endsWith(".pdf")) {
                return extractTextFromPdf(file);
            } else if (lowerFilename.endsWith(".docx")) {
                return extractTextFromDocx(file);
            } else if (lowerFilename.endsWith(".txt") || lowerFilename.endsWith(".md")) {
                return extractTextFromPlainText(file);
            } else {
                // Fallback attempt: try PDF first, then plain text
                try {
                    return extractTextFromPdf(file);
                } catch (Exception e) {
                    return extractTextFromPlainText(file);
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse resume document [{}]: {}", filename, e.getMessage(), e);
            throw new BadRequestException("Failed to extract text from " + filename + ": " + e.getMessage());
        }
    }

    private String extractTextFromPdf(MultipartFile file) throws Exception {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            return cleanExtractedText(text);
        }
    }

    private String extractTextFromDocx(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream();
             XWPFDocument doc = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return cleanExtractedText(extractor.getText());
        }
    }

    private String extractTextFromPlainText(MultipartFile file) throws Exception {
        String raw = new String(file.getBytes(), StandardCharsets.UTF_8);
        return cleanExtractedText(raw);
    }

    private String cleanExtractedText(String text) {
        if (!StringUtils.hasText(text)) {
            throw new BadRequestException("No readable text found in the document. If it is an image scan, please copy and paste the text.");
        }

        // Normalize multiple empty lines and special non-printable control chars while preserving newlines
        return text.replace("\r\n", "\n")
                   .replace("\r", "\n")
                   .replaceAll("[\\t\\x0B\\f]", " ")
                   .replaceAll("\n{3,}", "\n\n")
                   .trim();
    }
}
