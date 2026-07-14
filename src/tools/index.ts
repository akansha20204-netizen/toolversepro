import type { ComponentType } from "react";

import * as C from "./calculators";
import * as T from "./text";
import * as D from "./developer";
import * as U from "./converters";
import * as I from "./images";
import * as P from "./pdfs";

export const toolRegistry: Record<string, ComponentType> = {
  // Calculators
  "age-calculator": C.AgeCalculator,
  "bmi-calculator": C.BMICalculator,
  "emi-calculator": C.EMICalculator,
  "loan-calculator": C.LoanCalculator,
  "gst-calculator": C.GSTCalculator,
  "sip-calculator": C.SIPCalculator,
  "fd-calculator": C.FDCalculator,
  "percentage-calculator": C.PercentageCalculator,
  "discount-calculator": C.DiscountCalculator,
  "profit-loss-calculator": C.ProfitLossCalculator,
  "simple-interest-calculator": C.SimpleInterestCalculator,
  "compound-interest-calculator": C.CompoundInterestCalculator,
  "average-calculator": C.AverageCalculator,
  "date-difference-calculator": C.DateDifferenceCalculator,
  "time-duration-calculator": C.TimeDurationCalculator,
  // Text
  "word-counter": T.WordCounter,
  "character-counter": T.CharacterCounter,
  "case-converter": T.CaseConverter,
  "remove-extra-spaces": T.RemoveExtraSpaces,
  "remove-duplicate-lines": T.RemoveDuplicateLines,
  "text-sorter": T.TextSorter,
  "text-reverser": T.TextReverser,
  "lorem-ipsum": T.LoremIpsum,
  "slug-generator": T.SlugGenerator,
  "random-text": T.RandomText,
  // Developer
  "json-formatter": D.JSONFormatter,
  "json-validator": D.JSONValidator,
  "json-minifier": D.JSONMinifier,
  "html-beautifier": D.HTMLBeautifier,
  "html-minifier": D.HTMLMinifier,
  "css-beautifier": D.CSSBeautifier,
  "css-minifier": D.CSSMinifier,
  "js-beautifier": D.JSBeautifier,
  "password-generator": D.PasswordGenerator,
  "uuid-generator": D.UUIDGenerator,
  "json-to-csv": D.jsontocsvconverter,
  // Converters
  "length-converter": U.LengthConverter,
  "weight-converter": U.WeightConverter,
  "temperature-converter": U.TemperatureConverter,
  "area-converter": U.AreaConverter,
  "volume-converter": U.VolumeConverter,
  "speed-converter": U.SpeedConverter,
  "time-converter": U.TimeConverter,
  "data-converter": U.DataConverter,
  "pressure-converter": U.PressureConverter,
  "energy-converter": U.EnergyConverter,
  "json-to-csv": D.jsontocsvconverter,
  // Images
  "image-compressor": I.ImageCompressor,
  "image-resizer": I.ImageResizer,
  "image-cropper": I.ImageCropper,
  "image-rotator": I.ImageRotator,
  "image-flipper": I.ImageFlipper,
  "image-to-pdf": I.ImageToPDF,
  "images-to-pdf": I.ImagesToPDF,
  "image-to-base64": I.ImageToBase64,
  "base64-to-image": I.Base64ToImage,
  "image-format-converter": I.ImageFormatConverter,
  "image-color-picker": I.ImageColorPicker,
  "favicon-generator": I.FaviconGenerator,
  "image-grayscale": I.ImageGrayscale,
  "image-brightness-contrast": I.ImageBrightnessContrast,
  "exif-viewer": I.ExifViewer,
  // PDFs
  "pdf-merge": P.PDFMerge,
  "pdf-split": P.PDFSplit,
  "pdf-rotate": P.PDFRotate,
  "pdf-compress": P.PDFCompress,
  "pdf-to-images": P.PDFToImages,
  "pdf-extract-pages": P.PDFExtractPages,
  "pdf-delete-pages": P.PDFDeletePages,
  "pdf-reorder-pages": P.PDFReorder,
  "pdf-preview": P.PDFPreview,
  "pdf-page-counter": P.PDFPageCounter,
};
