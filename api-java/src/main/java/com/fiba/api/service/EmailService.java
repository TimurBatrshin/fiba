package com.fiba.api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Сервис для отправки электронной почты
 */
@Service
@Slf4j
public class EmailService {
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Отправка простого текстового письма
     * @param to адрес получателя
     * @param subject тема письма
     * @param text содержимое письма
     */
    @Async
    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            log.info("Email sent to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {} with subject: {}", to, subject, e);
        }
    }

    /**
     * Отправка HTML письма
     * @param to адрес получателя
     * @param subject тема письма
     * @param htmlContent HTML содержимое письма
     */
    @Async
    public void sendHtmlMessage(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("HTML email sent to {} with subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {} with subject: {}", to, subject, e);
        }
    }

    /**
     * Отправка письма подтверждения регистрации
     * @param to адрес получателя
     * @param verificationUrl ссылка для подтверждения регистрации
     */
    public void sendVerificationEmail(String to, String verificationUrl) {
        String subject = "Подтверждение регистрации в FIBA";
        String htmlContent = "<html><body>" +
                "<h2>Добро пожаловать в FIBA!</h2>" +
                "<p>Для завершения регистрации, пожалуйста, перейдите по ссылке:</p>" +
                "<p><a href='" + verificationUrl + "'>Подтвердить регистрацию</a></p>" +
                "<p>Если вы не регистрировались на нашем сайте, пожалуйста, проигнорируйте это письмо.</p>" +
                "<p>С уважением,<br/>Команда FIBA</p>" +
                "</body></html>";
        
        sendHtmlMessage(to, subject, htmlContent);
    }

    /**
     * Отправка письма о регистрации на турнир
     * @param to адрес получателя
     * @param tournamentName название турнира
     * @param teamName название команды
     */
    public void sendTournamentRegistrationEmail(String to, String tournamentName, String teamName) {
        String subject = "Регистрация на турнир " + tournamentName;
        String htmlContent = "<html><body>" +
                "<h2>Ваша команда зарегистрирована на турнир!</h2>" +
                "<p>Команда <strong>" + teamName + "</strong> успешно зарегистрирована на турнир <strong>" + tournamentName + "</strong>.</p>" +
                "<p>Детали турнира и расписание будут отправлены дополнительно.</p>" +
                "<p>С уважением,<br/>Команда FIBA</p>" +
                "</body></html>";
        
        sendHtmlMessage(to, subject, htmlContent);
    }

    /**
     * Отправка письма о сбросе пароля
     * @param to адрес получателя
     * @param resetUrl ссылка для сброса пароля
     */
    public void sendPasswordResetEmail(String to, String resetUrl) {
        String subject = "Сброс пароля в FIBA";
        String htmlContent = "<html><body>" +
                "<h2>Запрос на сброс пароля</h2>" +
                "<p>Мы получили запрос на сброс пароля для вашей учетной записи FIBA.</p>" +
                "<p>Для сброса пароля перейдите по ссылке:</p>" +
                "<p><a href='" + resetUrl + "'>Сбросить пароль</a></p>" +
                "<p>Если вы не запрашивали сброс пароля, пожалуйста, проигнорируйте это письмо или свяжитесь с нами.</p>" +
                "<p>С уважением,<br/>Команда FIBA</p>" +
                "</body></html>";
        
        sendHtmlMessage(to, subject, htmlContent);
    }
} 