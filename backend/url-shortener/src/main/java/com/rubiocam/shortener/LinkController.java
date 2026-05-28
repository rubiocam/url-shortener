package com.rubiocam.shortener;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService service;

    public LinkController(LinkService service) {
        this.service = service;
    }

    @GetMapping
    public List<Link> list() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    public Link get(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PostMapping
    public Link create(@Valid @RequestBody CreateLinkRequest request) {

        return service.create(
                request.originalUrl(),
                request.slug(),
                request.title(),
                request.notes()
        );
    }

    @PutMapping("/{id}")
    public Link update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLinkRequest request
    ) {

        return service.update(
                id,
                request.originalUrl(),
                request.title(),
                request.notes(),
                request.archived()
        );
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    public record CreateLinkRequest(
            @NotBlank String originalUrl,
            String slug,
            String title,
            String notes
    ) {
    }

    public record UpdateLinkRequest(
            @NotBlank String originalUrl,
            String title,
            String notes,
            boolean archived
    ) {
    }
}