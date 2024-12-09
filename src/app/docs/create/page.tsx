"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const AddDocument = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { usersOrg } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload a file.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'org', usersOrg, 'docRequests'), {
        title,
        content,
        fileName: file.name,
        fileType: file.type,
        createdAt: new Date(),
        status: 'pending'
      });
      console.log('Document request submitted with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding document request:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid .pdf or .docx file.');
      setFile(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <Input 
          id="title"
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Enter document title" 
        />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <Input 
          id="content"
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Enter document content" 
        />
      </div>
      <div>
        <label htmlFor="file">Upload File</label>
        <Input 
          id="file"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
      </div>
      <Button type="submit">Add Document</Button>
    </form>
  );
};

export default AddDocument;