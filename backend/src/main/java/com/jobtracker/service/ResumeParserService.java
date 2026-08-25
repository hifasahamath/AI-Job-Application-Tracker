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
import java.util.Set;

@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    private static final int MAX_EXTRACTED_CHARACTERS = 50000;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".docx", ".txt", ".md");

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded document file is empty or missing.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("Document file size exceeds the maximum allowed limit of 10MB.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new BadRequestException("Document filename cannot be empty.");
        }

        int dotIdx = filename.lastIndexOf('.');
        if (dotIdx == -1) {
            throw new BadRequestException("Document must have a valid extension (.pdf, .docx, .txt, .md).");
        }

        String ext = filename.substring(dotIdx).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("File type " + ext + " is not supported. Allowed formats: PDF, DOCX, TXT, MD.");
        }

        log.info("Extracting resume text from file [{}] size [{}] bytes", filename, file.getSize());

        try {
            if (ext.equals(".pdf")) {
                validatePdfHeader(file);
                return extractTextFromPdf(file);
            } else if (ext.equals(".docx")) {
                validateDocxHeader(file);
                return extractTextFromDocx(file);
            } else {
                return extractTextFromPlainText(file);
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse resume document [{}]: {}", filename, e.getMessage(), e);
            throw new BadRequestException("Failed to extract text from document: " + e.getMessage());
        }
    }

    private void validatePdfHeader(MultipartFile file) throws Exception {
        byte[] header = new byte[4];
        int read = file.getInputStream().read(header, 0, 4);
        if (read < 4 || header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) { // %PDF
            throw new BadRequestException("File does not match valid PDF binary signature.");
        }
    }

    private void validateDocxHeader(MultipartFile file) throws Exception {
        byte[] header = new byte[4];
        int read = file.getInputStream().read(header, 0, 4);
        if (read < 4 || header[0] != 0x50 || header[1] != 0x4B) { // PK zip signature
            throw new BadRequestException("File does not match valid DOCX binary signature.");
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
        String cleaned = text.replace("\r\n", "\n")
                             .replace("\r", "\n")
                             .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "")
                             .replaceAll("\n{3,}", "\n\n")
                             .trim();

        if (cleaned.length() > MAX_EXTRACTED_CHARACTERS) {
            cleaned = cleaned.substring(0, MAX_EXTRACTED_CHARACTERS);
        }

        return cleaned;
    }
}
