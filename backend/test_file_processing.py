"""
Test script for file processing utilities
Run this to verify file processing works correctly
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from file_processing import FileProcessor


def test_pdf_processing():
    """Test PDF file processing"""
    print("Testing PDF processing...")
    # You would need a sample PDF file to test
    # with open('sample.pdf', 'rb') as f:
    #     content = f.read()
    #     result = FileProcessor.process_file(content, 'application/pdf', 'sample.pdf')
    #     print(f"Extracted {result['word_count']} words in {result['chunk_count']} chunks")
    print("(Skipped - add sample PDF file to test)")


def test_txt_processing():
    """Test TXT file processing"""
    print("\nTesting TXT processing...")
    
    # Create sample text
    sample_text = """
    This is a sample legal document for testing purposes.
    
    Article 1: Introduction
    This document demonstrates the text extraction and chunking capabilities
    of the file processing system.
    
    Article 2: Terms and Conditions
    The system should properly extract and chunk this text for AI analysis.
    Multiple paragraphs should be preserved.
    
    Article 3: Conclusion
    This is the end of the sample document.
    """ * 10  # Repeat to create a larger document
    
    content = sample_text.encode('utf-8')
    
    try:
        result = FileProcessor.process_file(content, 'text/plain', 'sample.txt')
        print(f"✓ Extracted {result['word_count']} words")
        print(f"✓ Created {result['chunk_count']} chunks")
        print(f"✓ File size: {result['file_size']} bytes")
        print(f"✓ Character count: {result['char_count']}")
        
        # Test chunking
        if result['chunk_count'] > 1:
            print(f"✓ Multi-chunk document handled correctly")
            print(f"  First chunk length: {len(result['chunks'][0])}")
            print(f"  Last chunk length: {len(result['chunks'][-1])}")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")


def test_validation():
    """Test file validation"""
    print("\nTesting file validation...")
    
    # Test file too large
    large_content = b"x" * (11 * 1024 * 1024)  # 11MB
    is_valid, error = FileProcessor.validate_file(large_content, 'text/plain', 'large.txt')
    if not is_valid:
        print(f"✓ Large file rejected: {error}")
    
    # Test unsupported type
    is_valid, error = FileProcessor.validate_file(b"test", 'image/png', 'test.png')
    if not is_valid:
        print(f"✓ Unsupported type rejected: {error}")
    
    # Test valid file
    is_valid, error = FileProcessor.validate_file(b"test", 'text/plain', 'test.txt')
    if is_valid:
        print(f"✓ Valid file accepted")


def test_context_creation():
    """Test AI context creation"""
    print("\nTesting AI context creation...")
    
    chunks = [
        "This is the first section of the document.",
        "This is the second section with more content.",
        "This is the third section."
    ]
    
    question = "What does the document say about sections?"
    context = FileProcessor.create_context_for_ai(chunks, question)
    
    if "[Document Content" in context and "[User Question]" in context:
        print("✓ Context properly formatted")
        print(f"  Context length: {len(context)} characters")
    else:
        print("✗ Context formatting issue")


if __name__ == "__main__":
    print("=" * 60)
    print("File Processing Utilities Test Suite")
    print("=" * 60)
    
    test_validation()
    test_txt_processing()
    test_context_creation()
    # test_pdf_processing()  # Uncomment when you have sample PDF
    
    print("\n" + "=" * 60)
    print("Testing complete!")
    print("=" * 60)
