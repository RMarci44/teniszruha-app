import os
import zipfile

def package_ios():
    base_dir = "ios"
    zip_filename = "teniszruha-ios.zip"
    
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
        
    print(f"Creating {zip_filename}...")
    file_count = 0
    total_size = 0
    
    with zipfile.ZipFile(zip_filename, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Archive name starting with 'ios/'
                arcname = os.path.relpath(file_path, start=".")
                # Force forward slashes in zip archives for macOS/Linux compatibility
                arcname = arcname.replace('\\', '/')
                zipf.write(file_path, arcname)
                file_count += 1
                total_size += os.path.getsize(file_path)
                
    zip_size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
    print(f"Successfully packaged {file_count} files ({total_size / (1024*1024):.2f} MB uncompressed) into {zip_filename} ({zip_size_mb:.2f} MB).")

if __name__ == "__main__":
    package_ios()
