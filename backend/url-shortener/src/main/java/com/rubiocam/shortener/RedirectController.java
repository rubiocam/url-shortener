package com.rubiocam.shortener;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.OffsetDateTime;

@RestController
public class RedirectController {

    private final LinkRepository repository;

    public RedirectController(LinkRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{slug}")
    public void redirect(@PathVariable String slug, HttpServletResponse response) throws IOException {
        Link link = repository.findBySlugAndArchivedFalse(slug)
                .orElse(null);

        if (link == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        link.setClickCount(link.getClickCount() + 1);
        link.setLastClickedAt(OffsetDateTime.now());
        repository.save(link);

        response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
        response.setHeader("Location", link.getOriginalUrl());
    }
}