<?php
/**
 * Html editor upload
 * server.php
 *
 * PHP Version 5
 *
 * @category Production
 * @package  Default
 * @author   Philipp Tkachev <zoonman@gmail.com>
 * @date     1/1/15 5:46 PM
 * @license  http://www.zoonman.com/license.txt MMS License
 * @version  GIT: 1.0
 * @link     http://www.zoonman.com/
 */

header('Content-Type: application/json');
// list of popular allowed files (feel free to add yours, but be careful with it)
$extensionsWhiteList = [
    'png', 'jpg', 'jpeg', 'gif', // pictures
    'aac', 'mp3', 'flac', 'ogg', // music
    'mp4', 'flv', 'mov', 'avi', 'mkv', '3gp', // video
    'pdf', 'odt', 'odf', 'numbers', 'txt', 'doc', 'docx', 'xls', 'xlsx', // documents
    'zip', 'rar', '7zip', 'bzip', 'tar', 'gz' // archives
];

// make this directory writable to your server
$uploadDirectory = 'files/';
$results = array();
if (!empty($_FILES)) {
    foreach($_FILES as $file) {
        $ext = pathinfo(strtolower($file['name']), PATHINFO_EXTENSION);
        if (in_array($ext, $extensionsWhiteList)) {
            // server path
            $targetFilePath = $uploadDirectory . basename($file['name']);
            // file url, can be absolute or something else
            $targetFileUrl = $uploadDirectory . basename($file['name']);
            $results[] = array(
                'result' => move_uploaded_file($file['tmp_name'], $targetFilePath),
                'name' => $file['name'],
                'type' => $file['type'],
                'url' => $targetFileUrl
            );
        }
    }
}

echo json_encode($results, JSON_FORCE_OBJECT);
