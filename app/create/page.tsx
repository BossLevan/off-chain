"use client";

import type React from "react";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X, AlertCircle } from "lucide-react";
import { fileToBase64 } from "@/lib/utils/base64";

interface FormData {
  name: string;
  ticker: string;
  description: string;
  prompt: string;
  mainImage: File | null;
  sampleImages: File[];
}

interface FormErrors {
  name?: string;
  ticker?: string;
  description?: string;
  prompt?: string;
  mainImage?: string;
  sampleImages?: string;
}

export default function CreateCabin() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    ticker: "",
    description: "",
    prompt: "",
    mainImage: null,
    sampleImages: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const mainImageRef = useRef<HTMLInputElement>(null);
  const sampleImageRef = useRef<HTMLInputElement>(null);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "name":
        if (!value) return "Name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        if (value.length > 50) return "Name must be less than 50 characters";
        return "";
      case "ticker":
        if (!value) return "Ticker is required";

        if (value.length < 3) return "Ticker must be at least 3 characters";
        if (value.length > 10) return "Ticker must be less than 10 characters";
        return "";
      case "description":
        if (!value) return "Description is required";
        if (value.length < 10)
          return "Description must be at least 10 characters";
        if (value.length > 200)
          return "Description must be less than 200 characters";
        return "";
      case "prompt":
        if (!value) return "Prompt is required";
        // if (value.length < 20) return "Prompt must be at least 20 characters";
        if (value.length > 500)
          return "Prompt must be less than 500 characters";
        return "";
      case "mainImage":
        if (!value) return "Main image is required";
        return "";
      case "sampleImages":
        if (!value || value.length === 0)
          return "At least one sample image is required";
        return "";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof FormData]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, mainImage: e.target.files![0] }));
      setErrors((prev) => ({ ...prev, mainImage: "" }));
    }
  };

  const handleSampleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newImages = [...formData.sampleImages, e.target.files![0]].slice(
        0,
        3,
      );
      setFormData((prev) => ({
        ...prev,
        sampleImages: newImages,
      }));
      setErrors((prev) => ({ ...prev, sampleImages: "" }));
    }
  };

  const removeSampleImage = (index: number) => {
    const newImages = formData.sampleImages.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      sampleImages: newImages,
    }));
    if (newImages.length === 0) {
      setErrors((prev) => ({
        ...prev,
        sampleImages: "At least one sample image is required",
      }));
    }
  };

  const removeMainImage = () => {
    setFormData((prev) => ({ ...prev, mainImage: null }));
    setErrors((prev) => ({ ...prev, mainImage: "Main image is required" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {},
    );
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("symbol", formData.ticker.toUpperCase());
    submitData.append("description", formData.description);
    submitData.append("prompt", formData.prompt);

    formData.sampleImages.forEach((image) => {
      submitData.append("sampleImages", image); // use same key for all
    });

    //**********REFACTOR THIS INTO THE API.TS FILE*************** */
    try {
      //convert header image to base64
      // const base64Image = await fileToBase64(formData.mainImage as Blob);
      // //upload header image to ipfs
      // const imageResponse = await fetch("/api/image-upload", {
      //   method: "POST",
      //   body: JSON.stringify(base64Image),
      //   // ❌ Do NOT set 'Content-Type', the browser handles this automatically.
      // });
      // const data = await imageResponse.json();
      // let imageHash: string;
      // if (imageResponse.ok) {
      //   console.log("Image uploaded:", data.hash);
      //   //Assign the variable the ipfs hash
      //   imageHash = data.hash;
      //   submitData.append("imageIpfs", imageHash);
      // } else {
      //   console.error("Upload failed:", data);
      // }

      //hash: QmaNd3wsqBf8pqqA2ZxvfNx6HqbiebEfJKB5GbVzvsEWhK

      //Append the hash into the formdata

      submitData.append(
        "imageIpfs",
        "QmaNd3wsqBf8pqqA2ZxvfNx6HqbiebEfJKB5GbVzvsEWhK",
      );
      const response = await fetch(
        "/api/token?contract=0x1c93d155bd388241f9ab5df500d69eb529ce9583",
        {
          method: "GET",
        },
      );
      console.log(await response.json());
      // const response = await fetch("/api/create-token", {
      //   method: "POST",
      //   body: submitData,
      //   // ❌ Do NOT set 'Content-Type', the browser handles this automatically.
      // });

      // if (!response.ok) {
      //   const error = await response.json();
      //   console.error("Server error:", error.error);
      //   return;
      // }

      // const result = await response.json();
      // console.log("Success:", result);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0C0C0C] text-white">
      {/* Header */}
      <header className="sticky top-0 bg-black z-10">
        <div className="safe-top" />
        <div className="max-w-[480px] mx-auto px-4 py-4 flex items-center">
          <Link
            href="/"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[480px] mx-auto px-4 pb-32">
          <h1 className="text-3xl font-bold my-8 text-center">
            Launch a New Cabin
          </h1>

          {/* Main Image Upload */}
          <div className="mb-8">
            <input
              type="file"
              ref={mainImageRef}
              onChange={handleMainImageUpload}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => mainImageRef.current?.click()}
              className="w-32 h-32 mx-auto relative cursor-pointer"
            >
              {formData.mainImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={
                      URL.createObjectURL(formData.mainImage) ||
                      "/placeholder.svg"
                    }
                    alt="Main cabin"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMainImage();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`w-full h-full rounded-full bg-gradient-radial from-zinc-800 to-zinc-900 flex items-center justify-center border ${errors.mainImage && touched.mainImage ? "border-red-500" : "border-zinc-800"}`}
                >
                  <Plus className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            {errors.mainImage && touched.mainImage && (
              <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.mainImage}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prompt */}
            <div className="space-y-2">
              <label htmlFor="prompt" className="block text-lg">
                Prompt
              </label>
              <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Please test your prompts in the ChatGPT app to ensure consistency and accuracy"
                className={`w-full h-32 bg-zinc-900 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 border ${errors.prompt && touched.prompt ? "border-red-500" : "border-zinc-800/50"}`}
              />
              {errors.prompt && touched.prompt && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.prompt}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-lg">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-zinc-900 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 border ${errors.name && touched.name ? "border-red-500" : "border-zinc-800/50"}`}
              />
              {errors.name && touched.name && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Ticker */}
            <div className="space-y-2">
              <label htmlFor="ticker" className="block text-lg">
                Ticker
              </label>
              <input
                type="text"
                id="ticker"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-zinc-900 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 border ${errors.ticker && touched.ticker ? "border-red-500" : "border-zinc-800/50"}`}
              />
              {errors.ticker && touched.ticker && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.ticker}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-lg">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-zinc-900 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 border ${errors.description && touched.description ? "border-red-500" : "border-zinc-800/50"}`}
              />
              {errors.description && touched.description && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Sample Images */}
            <div className="space-y-2">
              <label className="block text-lg">Sample Images</label>
              <input
                type="file"
                ref={sampleImageRef}
                onChange={handleSampleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="aspect-square relative">
                    {formData.sampleImages[index] ? (
                      <div className="relative w-full h-full">
                        <img
                          src={
                            URL.createObjectURL(formData.sampleImages[index]) ||
                            "/placeholder.svg"
                          }
                          alt={`Sample ${index + 1}`}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                        <button
                          onClick={() => removeSampleImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => sampleImageRef.current?.click()}
                        className={`w-full h-full bg-zinc-900 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors border ${errors.sampleImages && touched.sampleImages ? "border-red-500" : "border-zinc-800"}`}
                      >
                        <Plus className="w-6 h-6 text-zinc-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.sampleImages && touched.sampleImages && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.sampleImages}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="sticky bottom-0 bg-black/50 backdrop-blur-lg z-10">
        <div className="max-w-[480px] mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* <p className="text-gray-400">
              <span className="text-green-500 mr-2">✓</span>
              You need 0.001 ETH to launch this cabin.
              <button className="text-blue-500 underline hover:text-blue-400 mx-1 inline">
                Buy here
              </button>
              (Bal: 0.00 ETH)
            </p> */}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 text-white py-4 rounded-full font-medium text-lg"
            >
              Launch
            </button>
          </div>
        </div>
        <div className="safe-bottom" />
      </div>
    </div>
  );
}
