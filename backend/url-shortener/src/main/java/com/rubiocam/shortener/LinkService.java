package com.rubiocam.shortener;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
public class LinkService {

    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private final SecureRandom random = new SecureRandom();
    private final LinkRepository repository;

    public LinkService(LinkRepository repository) {
        this.repository = repository;
    }

    public List<Link> listAll() {
        return repository.findAll();
    }

    public Link getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Link not found"));
    }

    public Link getActiveBySlug(String slug) {
        return repository.findBySlugAndArchivedFalse(slug)
                .orElseThrow(() -> new IllegalArgumentException("Link not found"));
    }

    @Transactional
    public Link create(String originalUrl, String slug, String title, String notes) {
        String finalSlug = (slug == null || slug.isBlank()) ? generateSlug() : slug.trim();

        if (repository.existsBySlug(finalSlug)) {
            throw new IllegalArgumentException("Slug already exists");
        }

        Link link = new Link();
        link.setSlug(finalSlug);
        link.setOriginalUrl(originalUrl.trim());
        link.setTitle(title);
        link.setNotes(notes);
        link.setArchived(false);

        return repository.save(link);
    }

    @Transactional
    public Link update(UUID id, String originalUrl, String title, String notes, boolean archived) {
        Link link = getById(id);
        link.setOriginalUrl(originalUrl.trim());
        link.setTitle(title);
        link.setNotes(notes);
        link.setArchived(archived);
        return repository.save(link);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    private String generateSlug() {
        while (true) {
            StringBuilder sb = new StringBuilder(7);
            for (int i = 0; i < 7; i++) {
                sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
            }
            String slug = sb.toString();
            if (!repository.existsBySlug(slug)) {
                return slug;
            }
        }
    }
}