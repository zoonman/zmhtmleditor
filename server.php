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
        $name = pathinfo(strtolower($file['name']), PATHINFO_FILENAME);
        if (in_array($ext, $extensionsWhiteList)) {
            // server path
            $targetFilePath = $uploadDirectory . basename($file['name']);
            // file url, can be absolute or something else
            $targetFileUrl = $uploadDirectory . basename($file['name']);

            $result = ['result' => false];
            if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
                $result = [
                    'result' => true,
                    'name' => $name,
                    'type' => $file['type'],
                    'url' => $targetFileUrl
                ];
                if (in_array($ext, ['png', 'jpg', 'jpeg', 'gif'])) {
                    // $result = array_merge($result, getimagesize($targetFilePath));
                    $imgsize = getimagesize($targetFilePath);
                    if ($imgsize) {
                        $result['width'] = $imgsize[0];
                        $result['height'] = $imgsize[1];
                        $result['bits'] = $imgsize['bits'];
                        $result['mime'] = $imgsize['mime'];
                    }

                }
            }


            $results[] = $result;
        }
    }
}

if (!empty($_POST)) {
    $results[] = $_POST;
}

echo json_encode(['files' => $results], JSON_FORCE_OBJECT);
