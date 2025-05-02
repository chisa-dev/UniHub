"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';
import { PiFileText, PiArrowLeft, PiDownload, PiShare, PiCopy, PiBookmark } from "react-icons/pi";

// Custom components for ReactMarkdown
const MarkdownComponents = {
  h1: (props: any) => <h1 className="text-2xl font-semibold my-4" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-semibold my-3" {...props} />,
  h3: (props: any) => <h3 className="text-lg font-medium my-3" {...props} />,
  h4: (props: any) => <h4 className="text-base font-medium my-2" {...props} />,
  p: (props: any) => <p className="my-3 leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside my-3 ml-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside my-3 ml-4" {...props} />,
  li: (props: any) => <li className="my-1" {...props} />,
  a: (props: any) => <a className="text-primaryColor hover:underline" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-4 border-primaryColor/30 pl-4 my-4 italic text-gray-600 dark:text-gray-300" {...props} />,
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="my-4 overflow-auto rounded-md">
        <pre className={`${className} bg-gray-100 dark:bg-gray-800 p-4 rounded-md`}>
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    ) : (
      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
        {children}
      </code>
    );
  },
  table: (props: any) => <table className="min-w-full divide-y divide-gray-300 my-4" {...props} />,
  thead: (props: any) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
  th: (props: any) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" {...props} />,
  tbody: (props: any) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
  tr: (props: any) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-900" {...props} />,
  td: (props: any) => <td className="px-3 py-2 whitespace-nowrap text-sm" {...props} />,
};

type NoteData = {
  id: string;
  title: string; 
  topic: string;
  date: string;
  content: string;
  readTime: string;
};

// Mock data - this would come from an API in a real implementation
const mockNotes: Record<string, NoteData> = {
  "1": {
    id: "1",
    title: "Calculus - Derivatives",
    topic: "Mathematics",
    date: "May 10, 2023",
    readTime: "8 min read",
    content: `# DSA: Learning Basic Concepts\n\n## Introduction to Data Structures and Algorithms\n- A program is written to solve a problem, which involves organizing data and defining a sequence of steps.\n- Data structures refer to how data is organized in a computer's memory.\n- Algorithms are the computational steps used to solve a problem.\n- Programs consist of data structures and algorithms.\n\n## Abstraction and Data Structures\n- Abstraction involves obtaining an abstract view or model of a problem to define its properties.\n- Abstraction helps in focusing on problem-related aspects and defining the data structure of the program.\n- An abstract data type (ADT) is an entity defined through abstraction.\n\n## Algorithms\n- Algorithms are well-defined computational procedures that take input and produce output.\n- Data structures represent the static part of a program's world, while algorithms model the dynamic part.\n- Algorithms are essential for handling the changing aspects of a program's environment.\n\n## Abstraction in Programming\n- Abstraction is the process of classifying relevant characteristics for a specific purpose and ignoring irrelevant aspects.\n- Successful programming relies on applying abstraction correctly.\n\n## Choosing the Right Algorithm\n- To solve a problem, multiple algorithms are available, and selecting the most suitable one requires a scientific method.\n- Classifying data is crucial for choosing the appropriate algorithm.\n\n### Example of Abstraction\n| Relevant Characteristics | Irrelevant Characteristics |\n|--------------------------|----------------------------|\n| Data type                | Color of the data          |\n| Operations involved      | Font style of the data      |\n\nRemember, successful programming involves understanding data structures, algorithms, and applying abstraction effectively.`
  },
  "2": {
    id: "2",
    title: "Understanding Object-Oriented Programming",
    topic: "Computer Science",
    date: "May 5, 2023",
    readTime: "10 min read",
    content: `# Object-Oriented Programming Concepts

## What is OOP?
Object-Oriented Programming (OOP) is a programming paradigm based on the concept of "objects", which can contain data and code. The data is in the form of fields (attributes or properties), and the code is in the form of procedures (methods).

## Core Principles of OOP

### 1. Encapsulation
Encapsulation is the bundling of data and the methods that operate on that data into a single unit or class. It restricts direct access to some of an object's components, which can prevent unintended interference and misuse.

\`\`\`python
class BankAccount:
    def __init__(self, account_number, balance):
        self.__account_number = account_number  # private attribute
        self.__balance = balance  # private attribute
        
    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
            return True
        return False
        
    def withdraw(self, amount):
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            return True
        return False
        
    def get_balance(self):
        return self.__balance
\`\`\`

### 2. Inheritance
Inheritance is a mechanism where a new class (derived or child class) can inherit attributes and methods from an existing class (base or parent class). This promotes code reusability.

\`\`\`python
class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species
        
    def make_sound(self):
        pass
        
class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name, species="Dog")
        self.breed = breed
        
    def make_sound(self):
        return "Woof!"
\`\`\`

### 3. Polymorphism
Polymorphism allows objects of different classes to be treated as objects of a common superclass. It's typically implemented by having methods with the same name but different implementations in different classes.

\`\`\`python
class Cat(Animal):
    def __init__(self, name, color):
        super().__init__(name, species="Cat")
        self.color = color
        
    def make_sound(self):
        return "Meow!"
        
# Polymorphic function
def animal_sound(animal):
    return animal.make_sound()
    
dog = Dog("Rex", "German Shepherd")
cat = Cat("Whiskers", "Tabby")

print(animal_sound(dog))  # Outputs: Woof!
print(animal_sound(cat))  # Outputs: Meow!
\`\`\`

### 4. Abstraction
Abstraction is the concept of hiding the complex implementation details and showing only the necessary features of an object. Abstract classes and interfaces are used to achieve abstraction.

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
        
    @abstractmethod
    def perimeter(self):
        pass
        
class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
        
    def area(self):
        return self.width * self.height
        
    def perimeter(self):
        return 2 * (self.width + self.height)
\`\`\`

## Benefits of OOP
- **Modularity**: Encapsulation enables objects to be self-contained, making troubleshooting and collaborative development easier.
- **Reusability**: Through inheritance, code can be reused, saving time and effort.
- **Flexibility**: Polymorphism allows for methods to be used on objects of various types.
- **Security**: Encapsulation provides control over which attributes can be accessed and modified.

## Design Patterns in OOP
Design patterns are reusable solutions to common problems in software design. Some popular OOP design patterns include:

1. **Singleton**: Ensures a class has only one instance and provides a global point of access to it.
2. **Factory**: Creates objects without exposing the instantiation logic.
3. **Observer**: Defines a one-to-many dependency between objects, so when one object changes state, all its dependents are notified.
4. **Strategy**: Defines a family of algorithms, encapsulates each one, and makes them interchangeable.

## Conclusion
Object-Oriented Programming is a powerful paradigm that, when applied correctly, can lead to more organized, maintainable, and scalable code. Understanding its core principles is essential for any developer.`
  }
};

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Use React.use to unwrap the params Promise
  const { id } = React.use(params);
  const [note, setNote] = useState<NoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would be an API call
    setIsLoading(true);
    setTimeout(() => {
      setNote(mockNotes[id] || null);
      setIsLoading(false);
    }, 500); // Simulate loading time
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1070px] mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primaryColor border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-n300 dark:text-n400">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="w-full max-w-[1070px] mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-medium mb-4">Note not found</h2>
        <p className="text-n300 dark:text-n400 mb-6">The note you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 py-2 px-4 bg-primaryColor text-white rounded-xl"
        >
          <PiArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1070px] mx-auto p-4">
      <div className="flex items-center mb-4">
        <button 
          onClick={() => router.back()} 
          className="text-n400 dark:text-n300 hover:text-primaryColor flex items-center gap-1"
        >
          <PiArrowLeft /> Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 order-2 md:order-1">
          <div className="bg-white dark:bg-n0 p-6 rounded-xl border border-primaryColor/20">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]} 
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={MarkdownComponents}
              >
                {note?.content || ''}
              </ReactMarkdown>
            </article>
          </div>
        </div>
        
        <div className="md:col-span-1 order-1 md:order-2">
          <div className="sticky top-4">
            <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20 mb-6">
              <h1 className="text-xl font-semibold mb-2">{note?.title}</h1>
              <div className="flex items-center text-sm text-n400 dark:text-n300 mb-4">
                <span className="mr-3">{note?.topic}</span>
                <span className="mr-3">•</span>
                <span>{note?.date}</span>
                <span className="mr-3">•</span>
                <span>{note?.readTime}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button className="flex items-center justify-center gap-1.5 py-2 px-4 bg-primaryColor text-white rounded-xl font-medium text-sm">
                  <PiDownload className="text-lg" /> Download
                </button>
                <button className="flex items-center justify-center gap-1.5 py-2 px-4 border border-primaryColor/20 text-primaryColor rounded-xl text-sm hover:bg-primaryColor/5">
                  <PiShare className="text-lg" /> Share
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-n0 p-5 rounded-xl border border-primaryColor/20">
              <h3 className="font-medium mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 p-3 text-sm border border-primaryColor/10 rounded-lg hover:bg-primaryColor/5">
                  <PiCopy className="text-primaryColor" /> 
                  <span>Copy to clipboard</span>
                </button>
                <button className="w-full flex items-center gap-2 p-3 text-sm border border-primaryColor/10 rounded-lg hover:bg-primaryColor/5">
                  <PiBookmark className="text-primaryColor" /> 
                  <span>Save to bookmarks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 