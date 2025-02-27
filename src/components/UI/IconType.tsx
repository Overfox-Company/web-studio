import React from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import styled from "@emotion/styled";
import Image from "next/image";
const docx = "../../static/images/docx.png";
const pdf = "../../static/images/pdf.png";
const html = "../../static/images/html.png";
const ppt = "../../static/images/ppt.png";
const txt = "../../static/images/txt.png";
const xlsx = "../../static/images/xlsx.png";
const ImageC = styled.img({
    width: "auto",
    height: "auto",
    maxWidth: "100%",
    maxHeight: "100%",
    display: "flex",
    borderRadius: "6px",
    alignSelf: "center",
    padding: "0.1vw",
});
const DocumentIcon = styled(DescriptionIcon)({
    fontSize: "7vw",
    display: "flex",
    opacity: 0.8,
    alignSelf: "center",
});
const FileIcon = styled.img({
    height: "12vh",
    width: "auto",
    display: "flex",
    opacity: 0.8,
    alignSelf: "center",
    marginBottom: "0.8vw",
});
const IconType = ({ file }: any) => {
    const isImage = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(file.name);
    const getFileFormat = (fileName: any) => {
        if (!fileName) return "document";
        const extension = fileName.split(".").pop().toLowerCase();

        switch (extension) {
            case "docx":
                return "docx";
            case "pdf":
                return "pdf";
            case "html":
                return "html";
            case "pptx":
                return "pptx";
            case "txt":
                return "txt";
            case "xlsx":
                return "xlsx";
            default:
                return "document";
        }
    };

    const fileFormat = getFileFormat(file.name);

    if (isImage) {
        return <ImageC src={file.url}

            alt={file.url} />;
    } else {
        if (fileFormat === "document") {
            return <DocumentIcon />;
        } else {
            return (
                <FileIcon
                    src={
                        fileFormat === "html"
                            ? html
                            : fileFormat === "pdf"
                                ? pdf
                                : fileFormat === "docx"
                                    ? docx
                                    : fileFormat === "pptx"
                                        ? ppt
                                        : fileFormat === "xlsx"
                                            ? xlsx
                                            : fileFormat === "txt"
                                                ? txt
                                                : undefined
                    }
                />
            );
        }
    }
};
export default IconType;
