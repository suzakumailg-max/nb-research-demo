<?php
/**
 * お問い合わせフォームの送信処理
 *
 * ▼ 公開前に必ず設定してください ▼
 *   MAIL_TO   : お問い合わせを受け取るメールアドレス
 *   MAIL_FROM : 送信元として使うアドレス。サイトと同じドメインのアドレスにすると迷惑メール判定されにくくなります。
 *               (お客様のアドレスは「返信先(Reply-To)」に入るので、受信メールにそのまま返信できます)
 */
const MAIL_TO   = 'info@example.com';
const MAIL_FROM = 'noreply@example.com';
const SITE_NAME = 'NBリサーチ';

mb_language('uni');
mb_internal_encoding('UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

function back_with_error(string $code): void
{
    header('Location: index.html?error=' . $code);
    exit;
}

// 改行を含む値はメールヘッダーの改ざん(ヘッダーインジェクション)に使われるため、1行項目では除去する
function single_line(string $value): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', $value));
}

// スパムボット対策:人には見えない欄に入力があれば、送信したことにして終了する
if (!empty($_POST['website'])) {
    header('Location: thanks.html');
    exit;
}

$name    = single_line((string)($_POST['name'] ?? ''));
$email   = single_line((string)($_POST['email'] ?? ''));
$subject = single_line((string)($_POST['subject'] ?? ''));
$message = trim(str_replace("\r\n", "\n", (string)($_POST['message'] ?? '')));

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    back_with_error('required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    back_with_error('email');
}

if (mb_strlen($name) > 100 || mb_strlen($subject) > 200 || mb_strlen($message) > 5000) {
    back_with_error('required');
}

$body  = "ホームページのお問い合わせフォームから送信がありました。\n\n";
$body .= "--------------------------------------------------\n";
$body .= '送信日時　　：' . date('Y/m/d H:i') . "\n";
$body .= '氏名　　　　：' . $name . "\n";
$body .= 'メールアドレス：' . $email . "\n";
$body .= '件名　　　　：' . $subject . "\n";
$body .= "--------------------------------------------------\n";
$body .= "【相談内容】\n" . $message . "\n";
$body .= "--------------------------------------------------\n";

$headers = [
    'From: ' . mb_encode_mimeheader(SITE_NAME) . ' <' . MAIL_FROM . '>',
    'Reply-To: ' . $email,
];

$sent = mb_send_mail(
    MAIL_TO,
    '【' . SITE_NAME . '】お問い合わせ：' . $subject,
    $body,
    implode("\r\n", $headers)
);

if (!$sent) {
    back_with_error('send');
}

header('Location: thanks.html');
exit;
